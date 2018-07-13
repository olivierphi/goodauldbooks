import typing as t

import graphene
from django.db import connection
from graphene_django.types import DjangoObjectType

from api_public.models import Book, Author, BookComputedData

# @link http://docs.graphene-python.org/projects/django/en/latest/tutorial-plain/
# @link http://docs.graphene-python.org/projects/django/en/latest/authorization/

DEFAULT_LIMIT = 10
MAX_LIMIT = 15


class BookComputedDataType(DjangoObjectType):
    class Meta:
        model = BookComputedData


class BookType(DjangoObjectType):
    computed_data = graphene.Field(BookComputedDataType)

    class Meta:
        model = Book


class AuthorType(DjangoObjectType):
    class Meta:
        model = Author


class BooksByCriteriaMetadata(graphene.ObjectType):
    nb_results = graphene.Int(required=True)
    nb_results_for_all_langs = graphene.Int(required=True)


class BooksByCriteria(graphene.ObjectType):
    books = graphene.List(graphene.NonNull(BookType))
    meta = graphene.Field(graphene.NonNull(BooksByCriteriaMetadata))


class Query():
    all_books = graphene.List(BookType, offset=graphene.Int(), limit=graphene.Int())
    all_authors = graphene.List(AuthorType, offset=graphene.Int(), limit=graphene.Int())
    book = graphene.Field(
        BookType,
        gutenberg_id=graphene.Int(),
        title=graphene.String()
    )
    author = graphene.Field(
        AuthorType,
        gutenberg_id=graphene.Int(),
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
        author_id=graphene.String(required=True),
        lang=graphene.String(),
        offset=graphene.Int(), limit=graphene.Int()
    )

    def resolve_all_books(self, info, **kwargs):
        offset = kwargs.get('offset', 0)
        limit = min(kwargs.get('limit', DEFAULT_LIMIT), MAX_LIMIT)

        return Book.objects.select_related('author').all()[offset:offset + limit]

    def resolve_all_authors(self, info, **kwargs):
        offset = kwargs.get('offset', 0)
        limit = min(kwargs.get('limit', DEFAULT_LIMIT), MAX_LIMIT)

        return Author.objects.prefetch_related('books').all()[offset:offset + limit]

    def resolve_book(self, info, **kwargs):
        gutenberg_id = kwargs.get('gutenberg_id')
        title = kwargs.get('title')

        has_something_to_resolve = any((gutenberg_id, title))

        if not has_something_to_resolve:
            return None

        criteria = dict()
        if gutenberg_id is not None:
            criteria['gutenberg_id'] = gutenberg_id
        if title is not None:
            criteria['title'] = title

        return Book.objects.select_related('author').get(**criteria)

    def resolve_author(self, info, **kwargs) -> t.Optional[Author]:
        gutenberg_id = kwargs.get('gutenberg_id')
        first_name = kwargs.get('first_name')
        last_name = kwargs.get('last_name')

        has_something_to_resolve = any((gutenberg_id, first_name, last_name))

        if not has_something_to_resolve:
            return None

        criteria = dict()
        if gutenberg_id is not None:
            criteria['gutenberg_id'] = gutenberg_id
        if first_name is not None:
            criteria['first_name'] = first_name
        if last_name is not None:
            criteria['last_name'] = last_name

        return Author.objects.prefetch_related('books').get(**criteria)

    def resolve_books_by_genre(self, info, **kwargs):
        genre = kwargs.get('genre')
        lang = kwargs.get('lang', 'all')
        offset = kwargs.get('offset', 0)
        limit = min(kwargs.get('limit', DEFAULT_LIMIT), MAX_LIMIT)

        books = Book.objects.select_related('author').prefetch_related('computed_data') \
            .filter(genres__title=genre)
        if lang != 'all':
            books = books.filter(lang=lang)
        books = books[offset:offset + limit]

        metadata = _get_books_by_genre_metadata(genre, lang)

        return BooksByCriteria(
            books=list(books),
            meta=metadata
        )

    def resolve_books_by_author(self, info, **kwargs):
        author_id = kwargs.get('author_id')
        lang = kwargs.get('lang', 'all')
        offset = kwargs.get('offset', 0)
        limit = min(kwargs.get('limit', DEFAULT_LIMIT), MAX_LIMIT)

        books = Book.objects.select_related('author').prefetch_related('computed_data') \
            .filter(author__author_id=author_id)
        if lang != 'all':
            books = books.filter(lang=lang)
        books = books[offset:offset + limit]

        metadata = _get_books_by_author_metadata(author_id, lang)

        return BooksByCriteria(
            books=list(books),
            meta=metadata
        )


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


def _get_books_by_author_metadata(author_id: int, lang: str) -> BooksByCriteriaMetadata:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            with 
            input as (
              select
                %s::integer as author_id,
                %s::varchar(3) as lang
            ),
            nb_results_total as (
                select
                  count(book_id) as count
                from
                  library.book as book
                  join library.author as author using(author_id)
                where
                  author.author_id = (select author_id from input) and
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
                          author.author_id = (select author_id from input)
                      )::integer
                  end as count
            )
            select
              (select count from nb_results_total)::integer as nb_results_total,
              (select count from nb_results_total_for_all_langs)::integer as nb_results_total_for_all_langs
            """
            ,
            [author_id, lang]
        )
        row = cursor.fetchone()
        metadata = {'nb_results_total': row[0], 'nb_results_total_for_all_langs': row[1]}

    return BooksByCriteriaMetadata(
        nb_results=metadata['nb_results_total'],
        nb_results_for_all_langs=metadata['nb_results_total_for_all_langs']
    )
