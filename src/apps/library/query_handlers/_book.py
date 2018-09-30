import typing as t

from django.db.models.query import QuerySet

from library.domain import GetBookByIdQuery, GetBooksQuery, PaginationRequest, MAX_LIMIT
from library.models import Book


def get_book_by_id(query: GetBookByIdQuery) -> Book:
    book_qs: QuerySet = Book.objects  # pylint: disable=no-member

    if query.fetch_author:
        book_qs = book_qs.select_related("author")
    if query.fetch_genres:
        book_qs = book_qs.prefetch_related("genres")

    book = book_qs.get(pk=query.book_id)

    return book


def get_books(query: GetBooksQuery) -> t.List[Book]:
    books_qs: QuerySet = Book.objects  # pylint: disable=no-member

    if query.author_id:
        books_qs = books_qs.filter(author__author_id=query.author_id)
    if query.genre:
        books_qs = books_qs.filter(genres__title=query.genre)
    if query.fetch_author:
        books_qs = books_qs.select_related("author")
    if query.fetch_genres:
        books_qs = books_qs.prefetch_related("genres")
    books_qs = books_qs.order_by("title", "subtitle")

    # pylint: disable=no-value-for-parameter
    pagination = query.pagination or PaginationRequest()
    page = max(int(pagination.page), 1)
    nb_per_page = min(int(pagination.nb_per_page), MAX_LIMIT)

    offset = (page - 1) * nb_per_page
    books = books_qs[offset : offset + nb_per_page]

    return books
