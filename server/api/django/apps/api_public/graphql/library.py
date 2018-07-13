import re
import typing as t

import graphene
from django.db import connection
from graphene_django.types import DjangoObjectType

from api_public.models import Book, Author, BookComputedData

# @link http://docs.graphene-python.org/projects/django/en/latest/tutorial-plain/
# @link http://docs.graphene-python.org/projects/django/en/latest/authorization/

DEFAULT_LIMIT = 10
MAX_LIMIT = 15

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


def _get_author_id_criteria(public_author_id: str) -> AuthorIdCriteria:
    author_id = 0
    gutenberg_id = 0
    pg_public_author_id_pattern_match = _public_pg_book_id_pattern.match(public_author_id)
    if pg_public_author_id_pattern_match:
        gutenberg_id = pg_public_author_id_pattern_match[1]
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


class BookType(DjangoObjectType):
    book_id = BookId()
    extra_data = graphene.Field(BookComputedDataType)

    def resolve_book_id(self, info, **kwargs):
        return _get_public_book_id(self)

    def resolve_extra_data(self, info, **kwargs):
        return self.computed_data

    class Meta:
        model = Book
        exclude_fields = ('computed_data')


class AuthorType(DjangoObjectType):
    author_id = AuthorId()

    def resolve_author_id(self, info, **kwargs):
        return _get_public_author_id(self)

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
        title=graphene.String()
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

    def resolve_all_books(self, info, **kwargs):
        offset = kwargs.get('offset', 0)
        limit = min(kwargs.get('limit', DEFAULT_LIMIT), MAX_LIMIT)

        return Book.objects.select_related('author').all()[offset:offset + limit]

    def resolve_all_authors(self, info, **kwargs):
        offset = kwargs.get('offset', 0)
        limit = min(kwargs.get('limit', DEFAULT_LIMIT), MAX_LIMIT)

        return Author.objects.prefetch_related('books').all()[offset:offset + limit]

    def resolve_book(self, info, **kwargs):
        title = kwargs.get('title')

        has_something_to_resolve = any((title,))

        if not has_something_to_resolve:
            return None

        books = Book.objects.select_related('author').prefetch_related('computed_data')

        criteria = dict()
        if title:
            criteria['title'] = title

        return books.get(**criteria)

    def resolve_author(self, info, **kwargs) -> t.Optional[Author]:
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
        public_author_id = kwargs.get('author_id')
        lang = kwargs.get('lang', 'all')
        offset = kwargs.get('offset', 0)
        limit = min(kwargs.get('limit', DEFAULT_LIMIT), MAX_LIMIT)

        books = Book.objects.select_related('author').prefetch_related('computed_data')
        author_id_criteria = _get_author_id_criteria(public_author_id)
        if author_id_criteria.gutenberg_id:
            books = books.filter(author__gutenberg_id=author_id_criteria.gutenberg_id)
        else:
            books = books.filter(author__author_id=author_id_criteria.author_id)

        if lang != 'all':
            books = books.filter(lang=lang)
        books = books[offset:offset + limit]

        metadata = _get_books_by_author_metadata(author_id_criteria, lang)

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
