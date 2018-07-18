import re
import typing as t

from django.db.models import QuerySet

import api_public.models as api_models

_public_pg_book_id_pattern = re.compile('^pg(\d+)$')
_public_pg_author_id_pattern = re.compile('^pg(\d+)$')


class BookIdCriteria(t.NamedTuple):
    book_id: int
    gutenberg_id: int


class AuthorIdCriteria(t.NamedTuple):
    author_id: int
    gutenberg_id: int


def get_public_book_id(book: api_models.Book) -> str:
    return f'pg{book.gutenberg_id}' if book.gutenberg_id is not None else str(book.book_id)


def get_public_author_id(author: api_models.Author) -> str:
    return f'pg{author.gutenberg_id}' if author.gutenberg_id is not None else str(author.author_id)


def get_book_id_criteria(public_book_id: str) -> BookIdCriteria:
    book_id = 0
    gutenberg_id = 0
    pg_public_book_id_pattern_match = _public_pg_book_id_pattern.match(public_book_id)
    if pg_public_book_id_pattern_match:
        gutenberg_id = int(pg_public_book_id_pattern_match[1])
    else:
        book_id = int(public_book_id)

    return BookIdCriteria(book_id=book_id, gutenberg_id=gutenberg_id)


def get_author_id_criteria(public_author_id: str) -> AuthorIdCriteria:
    author_id = 0
    gutenberg_id = 0
    pg_public_author_id_pattern_match = _public_pg_author_id_pattern.match(public_author_id)
    if pg_public_author_id_pattern_match:
        gutenberg_id = int(pg_public_author_id_pattern_match[1])
    else:
        author_id = int(public_author_id)

    return AuthorIdCriteria(author_id=author_id, gutenberg_id=gutenberg_id)


def get_books_base_queryset() -> QuerySet:
    return api_models.Book.objects.select_related('author').prefetch_related('computed_data').prefetch_related('genres')


def get_authors_base_queryset() -> QuerySet:
    return api_models.Author.objects.prefetch_related('books').prefetch_related('computed_data')


def get_single_book_by_public_id(public_book_id: str) -> api_models.Book:
    book_id_criteria = get_book_id_criteria(public_book_id)

    books = get_books_base_queryset()
    criteria = dict()
    if book_id_criteria.gutenberg_id:
        criteria['gutenberg_id'] = book_id_criteria.gutenberg_id
    else:
        criteria['author_id'] = book_id_criteria.author_id

    return books.get(**criteria)
