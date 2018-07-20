import json
import typing as t

import graphene
import graphql
from django.core.cache import cache
from django.db import connection
from django.db.models import Q, Value, PositiveSmallIntegerField, Case, When

import api_public.graphql.library.schema as gql_schema
import api_public.graphql.library.utils as library_utils
import api_public.models as api_models

# @link http://docs.graphene-python.org/projects/django/en/latest/tutorial-plain/
# @link http://docs.graphene-python.org/projects/django/en/latest/authorization/

DEFAULT_LIMIT = 10
MAX_LIMIT = 15

LANG_ALL = 'all'


class Query():
    all_books = graphene.List(gql_schema.BookType, offset=graphene.Int(), limit=graphene.Int())
    all_authors = graphene.List(gql_schema.AuthorType, offset=graphene.Int(), limit=graphene.Int())
    featured_books = graphene.List(
        graphene.NonNull(gql_schema.BookType)
    )
    quick_search = graphene.List(
        graphene.NonNull(gql_schema.QuickSearchResultType),
        search=graphene.String(required=True),
        lang=graphene.String(),
    )
    book = graphene.Field(
        gql_schema.BookType,
        book_id=gql_schema.BookId(required=True)
    )
    book_with_genres_stats = graphene.Field(
        gql_schema.BookWithGenresStatsType,
        book_id=gql_schema.BookId(required=True)
    )
    author = graphene.Field(
        gql_schema.AuthorType,
        author_id=gql_schema.AuthorId(),
        first_name=graphene.String(),
        last_name=graphene.String(),
    )
    books_by_genre = graphene.Field(
        gql_schema.BooksByCriteriaType,
        genre=graphene.String(required=True),
        lang=graphene.String(),
        page=graphene.Int(), nb_per_page=graphene.Int()
    )
    books_by_author = graphene.Field(
        gql_schema.BooksByCriteriaType,
        author_id=gql_schema.AuthorId(required=True),
        lang=graphene.String(),
        page=graphene.Int(), nb_per_page=graphene.Int()
    )

    def resolve_featured_books(self, info: graphql.ResolveInfo, **kwargs) -> t.List[api_models.Book]:
        featured_books_ids = cache.get('featured_books_ids')
        if featured_books_ids is None:
            featured_books_ids_raw = api_models.WebAppSettings.objects.get(name='featured_books_ids').value
            featured_books_ids = json.loads(featured_books_ids_raw)
            featured_books_ids = [library_utils.get_book_id_criteria(id).gutenberg_id for id in featured_books_ids]
            cache.set('featured_books_ids', featured_books_ids)

        return list(library_utils.get_books_base_queryset().filter(gutenberg_id__in=featured_books_ids))

    def resolve_quick_search(self, info: graphql.ResolveInfo, **kwargs) -> t.List[gql_schema.QuickSearchResultType]:
        search = kwargs.get('search')
        lang = kwargs.get('lang', LANG_ALL)

        # We first try to get 4 authors for the given search:
        authors = api_models.Author.objects.prefetch_related('computed_data')
        authors = authors.filter(
            Q(computed_data__full_name__istartswith=search) |
            Q(last_name__istartswith=search)
        )
        authors = authors.order_by('-computed_data__highlight', '-computed_data__nb_books', 'last_name')
        authors = authors[0:4]
        authors_quick_completion_results = [
            _author_to_quick_autocompletion_result(author)
            for author in authors
        ]

        # Ok, now we try to complete that results list with 4-8 books, in order to get 8 total results
        nb_books_max = 8 - len(authors_quick_completion_results)
        books = library_utils.get_books_base_queryset().prefetch_related('author__computed_data')
        if lang != LANG_ALL:
            books = books.filter(lang=lang)
        # we take all the books that CONTAIN that pattern...
        books = books.filter(title__icontains=search)
        # ...but then we look if it STARTS WITH the pattern...
        books = books.annotate(starts_with=Case(
            When(title__istartswith=search, then=Value(1)),
            default=Value(0),
            output_field=PositiveSmallIntegerField()
        ))
        # ...and prioritise the books that START with the pattern:
        books = books.order_by('-starts_with', '-highlight', 'title')
        books = books[0:nb_books_max]
        books_quick_completion_results = [
            _book_to_quick_autocompletion_result(book)
            for book in books
        ]

        # All right, finally we can return the books results, followed by the authors results:
        return books_quick_completion_results + authors_quick_completion_results

    def resolve_book_with_genres_stats(self, info: graphql.ResolveInfo, **kwargs) -> t.Union[
        gql_schema.BookWithGenresStatsType, None]:
        public_book_id = kwargs.get('book_id')

        book = library_utils.get_single_book_by_public_id(public_book_id)

        if book is None:
            return None

        book_genres_ids = [genre.genre_id for genre in book.genres.all()]
        book_genres_with_stats = api_models.GenreWithStats.objects.filter(genre_id__in=book_genres_ids)

        returned_genres_with_stats = [
            _genres_w_stats_to_graphql_equivalent(genre_with_stats)
            for genre_with_stats in book_genres_with_stats.all()
        ]

        return gql_schema.BookWithGenresStatsType(
            book=book,
            genres_stats=returned_genres_with_stats
        )



def _get_books_by_genre_metadata(genre: str, lang: str) -> gql_schema.BooksByCriteriaMetadataType:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            with 
            input as (
              select
                %s::varchar as genre,
                %s::varchar(3) as lang
            ),
            total_count as (
                select
                  count(book_id) as count
                from
                  library.book as book
                  join library.book_genre using(book_id)
                  join library.genre as genre using(genre_id)
                where
                  genre.title = (select genre from input) and
                  case
                    when (select lang from input) = 'all' then true
                    else lang = (select lang from input)
                  end
            ),
            total_count_for_all_langs as (
                select
                  case
                    when (select lang from input) = 'all' then
                      (select count from total_count)::integer
                    else
                      (
                        select
                          count(*)
                        from
                          library.book as book
                          join library.book_genre using(book_id)
                          join library.genre as genre using(genre_id)
                        where
                          genre.title = (select genre from input)
                      )::integer
                  end as count
            )
            select
              (select count from total_count)::integer as total_count,
              (select count from total_count_for_all_langs)::integer as total_count_for_all_langs
            """
            ,
            [genre, lang]
        )
        row = cursor.fetchone()
        metadata = {'total_count': row[0], 'total_count_for_all_langs': row[1]}

    return gql_schema.BooksByCriteriaMetadataType(
        total_count=metadata['total_count'],
        total_count_for_all_langs=metadata['total_count_for_all_langs']
    )


def _get_books_by_author_metadata(author_id: library_utils.AuthorIdCriteria,
                                  lang: str) -> gql_schema.BooksByCriteriaMetadataType:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            with 
            input as (
              select
                %s::integer as author_id,
                %s::integer as gutenberg_id,
                %s::varchar(3) as lang
            ),
            total_count as (
                select
                  count(book_id) as count
                from
                  library.book as book
                  join library.author as author using(author_id)
                where
                  case
                    when (select gutenberg_id from input) = 0 then 
                      author.author_id = (select author_id from input)
                    else 
                      author.gutenberg_id = (select gutenberg_id from input)
                  end
                  and
                  case
                    when (select lang from input) = 'all' then true
                    else lang = (select lang from input)
                  end
            ),
            total_count_for_all_langs as (
                select
                  case
                    when (select lang from input) = 'all' then
                      (select count from total_count)::integer
                    else
                      (
                        select
                          count(*)
                        from
                          library.book as book
                          join library.author as author using(author_id)
                        where
                          case
                            when (select gutenberg_id from input) = 0 then 
                              author.author_id = (select author_id from input)
                            else 
                              author.gutenberg_id = (select gutenberg_id from input)
                          end
                      )::integer
                  end as count
            )
            select
              (select count from total_count)::integer as total_count,
              (select count from total_count_for_all_langs)::integer as total_count_for_all_langs
            """
            ,
            [author_id.author_id, author_id.gutenberg_id, lang]
        )
        row = cursor.fetchone()
        metadata = {'total_count': row[0], 'total_count_for_all_langs': row[1]}

    return gql_schema.BooksByCriteriaMetadataType(
        total_count=metadata['total_count'],
        total_count_for_all_langs=metadata['total_count_for_all_langs']
    )


def _author_to_quick_autocompletion_result(author: api_models.Author) -> gql_schema.QuickSearchResultType:
    return gql_schema.QuickSearchResultType(
        type=gql_schema.QuickAutocompletionResultEnumType.AUTHOR,
        book_id=None,
        book_title=None,
        book_lang=None,
        book_slug=None,
        author_id=library_utils.get_public_author_id(author),
        author_first_name=author.first_name,
        author_last_name=author.last_name,
        author_slug=author.computed_data.slug,
        author_nb_books=author.computed_data.nb_books,
        highlight=author.computed_data.highlight,
    )


def _book_to_quick_autocompletion_result(book: api_models.Book) -> gql_schema.QuickSearchResultType:
    return gql_schema.QuickSearchResultType(
        type=gql_schema.QuickAutocompletionResultEnumType.BOOK,
        book_id=library_utils.get_public_book_id(book),
        book_title=book.title,
        book_lang=book.lang,
        book_slug=book.computed_data.slug,
        author_id=library_utils.get_public_author_id(book.author),
        author_first_name=book.author.first_name,
        author_last_name=book.author.last_name,
        author_slug=book.author.computed_data.slug,
        author_nb_books=book.author.computed_data.nb_books,
        highlight=book.highlight,
    )


def _genres_w_stats_to_graphql_equivalent(genreWithStats: api_models.GenreWithStats) -> gql_schema.GenreStatsType:
    nb_books_by_lang: t.List[gql_schema.GenreStatsNbBooksByLangType] = [
        gql_schema.GenreStatsNbBooksByLangType(lang=lang, nb_books=nb_books)
        for (lang, nb_books) in genreWithStats.nb_books_by_lang.items()
    ]

    return gql_schema.GenreStatsType(
        title=genreWithStats.title,
        nb_books=genreWithStats.nb_books,
        nb_books_by_lang=nb_books_by_lang
    )
