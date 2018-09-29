import typing as t

from django.db.models.query import QuerySet

from library.domain import (
    BookRepository as AbstractBookRepository,
    PaginationRequest,
    MAX_LIMIT,
)
from library.models import Book


class _BookRepository(AbstractBookRepository):
    def get_book_by_id(
        self, book_id: str, *, fetch_author: bool = False, fetch_genres: bool = False
    ) -> Book:
        book_qs: QuerySet = Book.objects  # pylint: disable=no-member

        if fetch_author:
            book_qs = book_qs.select_related("author")
        if fetch_genres:
            book_qs = book_qs.prefetch_related("genres")

        book = book_qs.get(pk=book_id)

        return book

    def get_books(
        self,
        *,
        author_id: t.Optional[str] = None,
        genre: t.Optional[str] = None,
        pagination: t.Optional[PaginationRequest] = None,
        fetch_author: bool = False,
        fetch_genres: bool = False,
    ) -> t.List[Book]:
        books_qs: QuerySet = Book.objects  # pylint: disable=no-member
        if author_id:
            books_qs = books_qs.filter(author__author_id=author_id)
        if genre:
            books_qs = books_qs.filter(genres__title=genre)
        if fetch_author:
            books_qs = books_qs.select_related("author")
        if fetch_genres:
            books_qs = books_qs.prefetch_related("genres")
        books_qs = books_qs.order_by("title", "subtitle")

        if pagination is None:
            pagination = PaginationRequest()  # pylint: disable=no-value-for-parameter
        page = max(int(pagination.page), 1)
        nb_per_page = min(int(pagination.nb_per_page), MAX_LIMIT)

        offset = (page - 1) * nb_per_page
        books = books_qs[offset : offset + nb_per_page]

        return books


repository: AbstractBookRepository = _BookRepository()  # pylint: disable=invalid-name
