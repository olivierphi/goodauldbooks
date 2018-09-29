from abc import ABC, abstractmethod

from library.models import Book


class BookRepository(ABC):
    @abstractmethod
    def get_book_by_id(self, book_id: str) -> Book:
        pass
