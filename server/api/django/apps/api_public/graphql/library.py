import json
import re
import typing as t

import graphene
from django.core.cache import cache
from django.db import connection
from django.db.models import QuerySet, Q, When, Value, Case, PositiveSmallIntegerField
from graphene_django.types import DjangoObjectType

from api_public.models import Book, Author, BookComputedData, WebAppSettings, AuthorComputedData, GenreWithStats

# @link http://docs.graphene-python.org/projects/django/en/latest/tutorial-plain/
# @link http://docs.graphene-python.org/projects/django/en/latest/authorization/

DEFAULT_LIMIT = 10
MAX_LIMIT = 15

LANG_ALL = 'all'

_public_pg_book_id_pattern = re.compile('^pg(\d+)$')
_public_pg_author_id_pattern = re.compile('^pg(\d+)$')


class BookIdCriteria(t.NamedTuple):
    book_id: int
    gutenberg_id: int


class AuthorIdCriteria(t.NamedTuple):
    author_id: int
    gutenberg_id: int


def _get_public_book_id(book: Book) -> str:
    return f'pg{book.gutenberg_id}' if book.gutenberg_id is not None else str(book.book_id)


def _get_public_author_id(author: Author) -> str:
    return f'pg{author.gutenberg_id}' if author.gutenberg_id is not None else str(author.author_id)


def _get_book_id_criteria(public_book_id: str) -> BookIdCriteria:
    book_id = 0
    gutenberg_id = 0
    pg_public_book_id_pattern_match = _public_pg_book_id_pattern.match(public_book_id)
    if pg_public_book_id_pattern_match:
        gutenberg_id = int(pg_public_book_id_pattern_match[1])
    else:
        book_id = int(public_book_id)

    return BookIdCriteria(book_id=book_id, gutenberg_id=gutenberg_id)


def _get_author_id_criteria(public_author_id: str) -> AuthorIdCriteria:
    author_id = 0
    gutenberg_id = 0
    pg_public_author_id_pattern_match = _public_pg_author_id_pattern.match(public_author_id)
    if pg_public_author_id_pattern_match:
        gutenberg_id = int(pg_public_author_id_pattern_match[1])
    else:
        author_id = int(public_author_id)

    return AuthorIdCriteria(author_id=author_id, gutenberg_id=gutenberg_id)


class BookId(graphene.String):
    pass


class AuthorId(graphene.String):
    pass


class BookComputedDataType(DjangoObjectType):
    class Meta:
        model = BookComputedData
        exclude_fields = ('book_id',)


class QuickAutocompletionResultType(graphene.Enum):
    BOOK = 'book'
    AUTHOR = 'author'


class QuickAutocompletionResult(graphene.ObjectType):
    type = QuickAutocompletionResultType(required=True)
    book_id = BookId()
    book_title = graphene.String()
    book_lang = graphene.String()
    book_slug = graphene.String()
    author_id = AuthorId()
    author_first_name = graphene.String()
    author_last_name = graphene.String()
    author_slug = graphene.String()
    author_nb_books = graphene.Int(required=True)
    highlight = graphene.Int(required=True)


class BookType(DjangoObjectType):
    book_id = BookId()
    extra = graphene.Field(BookComputedDataType)  # just an alias to 'computed_data' :-)
    genres = graphene.List(graphene.String)

    def resolve_book_id(self, info, **kwargs):
        return _get_public_book_id(self)

    def resolve_extra(self, info, **kwargs):
        return self.computed_data

    def resolve_genres(self, info, **kwargs):
        return [genre.title for genre in self.genres.all()]

    class Meta:
        model = Book
        exclude_fields = ('id', 'computed_data', 'highlight')


class AuthorComputedDataType(DjangoObjectType):
    class Meta:
        model = AuthorComputedData
        exclude_fields = ('author_id',)


class AuthorType(DjangoObjectType):
    author_id = AuthorId()
    extra = graphene.Field(AuthorComputedDataType)  # just an alias to 'computed_data' :-)

    def resolve_author_id(self, info, **kwargs):
        return _get_public_author_id(self)

    def resolve_extra(self, info, **kwargs):
        return self.computed_data

    class Meta:
        model = Author
        exclude_fields = ('id')


class BooksByCriteriaMetadata(graphene.ObjectType):
    nb_results = graphene.Int(required=True)
    nb_results_for_all_langs = graphene.Int(required=True)


class BooksByCriteria(graphene.ObjectType):
    books = graphene.List(graphene.NonNull(BookType))
    meta = graphene.Field(graphene.NonNull(BooksByCriteriaMetadata))


class GenreStatsNbBooksByLang(graphene.ObjectType):
    lang = graphene.String()
    nb_books = graphene.Int()


class GenreStats(graphene.ObjectType):
    title = graphene.String()
    nb_books = graphene.Int()
    nb_books_by_lang = graphene.List(GenreStatsNbBooksByLang)


class BookWithGenresStats(graphene.ObjectType):
    book = graphene.Field(BookType)
    genres_stats = graphene.List(GenreStats)


class Query():
    all_books = graphene.List(BookType, offset=graphene.Int(), limit=graphene.Int())
    all_authors = graphene.List(AuthorType, offset=graphene.Int(), limit=graphene.Int())
    featured_books = graphene.List(
        graphene.NonNull(BookType)
    )
    quick_autocompletion = graphene.List(
        graphene.NonNull(QuickAutocompletionResult),
        search=graphene.String(required=True),
        lang=graphene.String(),
    )
    book = graphene.Field(
        BookType,
        book_id=BookId(required=True)
    )
    book_with_genres_stats = graphene.Field(
        BookWithGenresStats,
        book_id=BookId(required=True)
    )
    author = graphene.Field(
        AuthorType,
        author_id=AuthorId(),
        first_name=graphene.String(),
        last_name=graphene.String(),
    )
    books_by_genre = graphene.Field(
        BooksByCriteria,
        genre=graphene.String(required=True),
        lang=graphene.String(),
        offset=graphene.Int(), limit=graphene.Int()
    )
    books_by_author = graphene.Field(
        BooksByCriteria,
        author_id=AuthorId(required=True),
        lang=graphene.String(),
        offset=graphene.Int(), limit=graphene.Int()
    )

    def resolve_featured_books(self, info, **kwargs) -> t.List[Book]:
        featured_books_ids = cache.get('featured_books_ids')
        if featured_books_ids is None:
            featured_books_ids_raw = WebAppSettings.objects.get(name='featured_books_ids').value
            featured_books_ids = json.loads(featured_books_ids_raw)
            featured_books_ids = [_get_book_id_criteria(id).gutenberg_id for id in featured_books_ids]
            cache.set('featured_books_ids', featured_books_ids)

        return _get_books_base_queryset().filter(gutenberg_id__in=featured_books_ids)

    def resolve_quick_autocompletion(self, info, **kwargs) -> t.List[QuickAutocompletionResult]:
        search = kwargs.get('search')
        lang = kwargs.get('lang', LANG_ALL)

        # We first try to get 4 authors for the given search:
        authors = Author.objects.prefetch_related('computed_data')
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
        books = _get_books_base_queryset().prefetch_related('author__computed_data')
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

    def resolve_all_books(self, info, **kwargs) -> t.List[Book]:
        offset = kwargs.get('offset', 0)
        limit = min(kwargs.get('limit', DEFAULT_LIMIT), MAX_LIMIT)

        return _get_books_base_queryset().all()[offset:offset + limit]

    def resolve_all_authors(self, info, **kwargs) -> t.List[Author]:
        offset = kwargs.get('offset', 0)
        limit = min(kwargs.get('limit', DEFAULT_LIMIT), MAX_LIMIT)

        return _get_authors_base_queryset().all()[offset:offset + limit]

    def resolve_book(self, info, **kwargs) -> t.Union[Book, None]:
        public_book_id = kwargs.get('book_id')

        book = _get_single_book_by_public_id(public_book_id)

        return book

    def resolve_book_with_genres_stats(self, info, **kwargs) -> t.Union[BookWithGenresStats, None]:
        public_book_id = kwargs.get('book_id')

        book = _get_single_book_by_public_id(public_book_id)

        if book is None:
            return None

        book_genres_ids = [genre.genre_id for genre in book.genres.all()]
        book_genres_with_stats = GenreWithStats.objects.filter(genre_id__in=book_genres_ids)

        returned_genres_with_stats = [
            _genres_w_stats_to_graphql_equivalent(genre_with_stats)
            for genre_with_stats in book_genres_with_stats.all()
        ]

        return BookWithGenresStats(
            book=book,
            genres_stats=returned_genres_with_stats
        )

    def resolve_author(self, info, **kwargs) -> t.Union[Author, None]:
        public_author_id = kwargs.get('author_id')
        first_name = kwargs.get('first_name')
        last_name = kwargs.get('last_name')

        has_something_to_resolve = any((public_author_id, first_name, last_name))

        if not has_something_to_resolve:
            return None

        criteria = dict()
        if public_author_id:
            author_id_criteria = _get_author_id_criteria(public_author_id)
            if author_id_criteria.gutenberg_id:
                criteria['gutenberg_id'] = author_id_criteria.gutenberg_id
            else:
                criteria['author_id'] = author_id_criteria.author_id
        if first_name:
            criteria['first_name'] = first_name
        if last_name:
            criteria['last_name'] = last_name

        return _get_authors_base_queryset().get(**criteria)

    def resolve_books_by_genre(self, info, **kwargs) -> BooksByCriteria:
        genre = kwargs.get('genre')
        lang = kwargs.get('lang', LANG_ALL)
        offset = kwargs.get('offset', 0)
        limit = min(kwargs.get('limit', DEFAULT_LIMIT), MAX_LIMIT)

        books = _get_books_base_queryset().filter(genres__title=genre)
        if lang != LANG_ALL:
            books = books.filter(lang=lang)
        books = books[offset:offset + limit]

        metadata = _get_books_by_genre_metadata(genre, lang)

        return BooksByCriteria(
            books=list(books),
            meta=metadata
        )

    def resolve_books_by_author(self, info, **kwargs) -> BooksByCriteria:
        public_author_id = kwargs.get('author_id')
        lang = kwargs.get('lang', LANG_ALL)
        offset = kwargs.get('offset', 0)
        limit = min(kwargs.get('limit', DEFAULT_LIMIT), MAX_LIMIT)

        books = _get_books_base_queryset()
        author_id_criteria = _get_author_id_criteria(public_author_id)
        if author_id_criteria.gutenberg_id:
            books = books.filter(author__gutenberg_id=author_id_criteria.gutenberg_id)
        else:
            books = books.filter(author__author_id=author_id_criteria.author_id)

        if lang != LANG_ALL:
            books = books.filter(lang=lang)
        books = books[offset:offset + limit]

        metadata = _get_books_by_author_metadata(author_id_criteria, lang)

        return BooksByCriteria(
            books=list(books),
            meta=metadata
        )


def _get_books_base_queryset() -> QuerySet:
    return Book.objects.select_related('author').prefetch_related('computed_data').prefetch_related('genres')


def _get_authors_base_queryset() -> QuerySet:
    return Author.objects.prefetch_related('books').prefetch_related('computed_data')


def _get_single_book_by_public_id(public_book_id: str) -> Book:
    book_id_criteria = _get_book_id_criteria(public_book_id)

    books = _get_books_base_queryset()
    criteria = dict()
    if book_id_criteria.gutenberg_id:
        criteria['gutenberg_id'] = book_id_criteria.gutenberg_id
    else:
        criteria['author_id'] = book_id_criteria.author_id

    return books.get(**criteria)


def _get_books_by_genre_metadata(genre: str, lang: str) -> BooksByCriteriaMetadata:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            with 
            input as (
              select
                %s::varchar as genre,
                %s::varchar(3) as lang
            ),
            nb_results_total as (
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
            nb_results_total_for_all_langs as (
                select
                  case
                    when (select lang from input) = 'all' then
                      (select count from nb_results_total)::integer
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
              (select count from nb_results_total)::integer as nb_results_total,
              (select count from nb_results_total_for_all_langs)::integer as nb_results_total_for_all_langs
            """
            ,
            [genre, lang]
        )
        row = cursor.fetchone()
        metadata = {'nb_results_total': row[0], 'nb_results_total_for_all_langs': row[1]}

    return BooksByCriteriaMetadata(
        nb_results=metadata['nb_results_total'],
        nb_results_for_all_langs=metadata['nb_results_total_for_all_langs']
    )


def _get_books_by_author_metadata(author_id: AuthorIdCriteria, lang: str) -> BooksByCriteriaMetadata:
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
            nb_results_total as (
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
            nb_results_total_for_all_langs as (
                select
                  case
                    when (select lang from input) = 'all' then
                      (select count from nb_results_total)::integer
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
              (select count from nb_results_total)::integer as nb_results_total,
              (select count from nb_results_total_for_all_langs)::integer as nb_results_total_for_all_langs
            """
            ,
            [author_id.author_id, author_id.gutenberg_id, lang]
        )
        row = cursor.fetchone()
        metadata = {'nb_results_total': row[0], 'nb_results_total_for_all_langs': row[1]}

    return BooksByCriteriaMetadata(
        nb_results=metadata['nb_results_total'],
        nb_results_for_all_langs=metadata['nb_results_total_for_all_langs']
    )


def _author_to_quick_autocompletion_result(author: Author) -> QuickAutocompletionResult:
    return QuickAutocompletionResult(
        type=QuickAutocompletionResultType.AUTHOR.value,
        book_id=None,
        book_title=None,
        book_lang=None,
        book_slug=None,
        author_id=_get_public_author_id(author),
        author_first_name=author.first_name,
        author_last_name=author.last_name,
        author_slug=author.computed_data.slug,
        author_nb_books=author.computed_data.nb_books,
        highlight=author.computed_data.highlight,
    )


def _book_to_quick_autocompletion_result(book: Book) -> QuickAutocompletionResult:
    return QuickAutocompletionResult(
        type=QuickAutocompletionResultType.BOOK.value,
        book_id=_get_public_book_id(book),
        book_title=book.title,
        book_lang=book.lang,
        book_slug=book.computed_data.slug,
        author_id=_get_public_author_id(book.author),
        author_first_name=book.author.first_name,
        author_last_name=book.author.last_name,
        author_slug=book.author.computed_data.slug,
        author_nb_books=book.author.computed_data.nb_books,
        highlight=book.highlight,
    )


def _genres_w_stats_to_graphql_equivalent(genreWithStats: GenreWithStats) -> GenreStats:
    nb_books_by_lang: t.List[GenreStatsNbBooksByLang] = [
        GenreStatsNbBooksByLang(lang=lang, nb_books=nb_books)
        for (lang, nb_books) in genreWithStats.nb_books_by_lang.items()
    ]

    return GenreStats(
        title=genreWithStats.title,
        nb_books=genreWithStats.nb_books,
        nb_books_by_lang=nb_books_by_lang
    )
