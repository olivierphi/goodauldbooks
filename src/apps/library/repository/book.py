from django.db.models.query import QuerySet

from library.domain import BookRepository as AbstractBookRepository
from library.models import Book


class _BookRepository(AbstractBookRepository):
    def get_book_by_id(
        self, book_id: str, *, fetch_author: bool = False, fetch_genres: bool = False
    ) -> Book:
        book_qs: QuerySet = Book.objects

        if fetch_author:
            book_qs = book_qs.select_related("author")
        if fetch_genres:
            book_qs = book_qs.prefetch_related("genres")

        book = book_qs.get(pk=book_id)

        return book


repository: AbstractBookRepository = _BookRepository()  # pylint: disable=invalid-name
