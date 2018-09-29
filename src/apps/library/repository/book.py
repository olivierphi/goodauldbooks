from library.domain import BookRepository as AbstractBookRepository


from library.models import Book


class _BookRepository(AbstractBookRepository):
    def get_book_by_id(self, book_id: str) -> Book:
        return Book.objects.get(pk=book_id)


repository: AbstractBookRepository = _BookRepository()  # pylint: disable=invalid-name
