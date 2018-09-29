from django.db.models.query import QuerySet

from library.domain import AuthorRepository as AbstractAuthorRepository
from library.models import Author


class _AuthorkRepository(AbstractAuthorRepository):
    def get_author_by_id(self, author_id: str, *, fetch_books: bool = False) -> Author:
        author_qs: QuerySet = Author.objects

        if fetch_books:
            author_qs = author_qs.prefetch_related("books")

        author = author_qs.get(pk=author_id)

        return author


repository: AbstractAuthorRepository = _AuthorkRepository()  # pylint: disable=invalid-name
