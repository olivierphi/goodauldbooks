from abc import ABC, abstractmethod

from library.models import Author, Book


class BookRepository(ABC):
    @abstractmethod
    def get_book_by_id(
        self, book_id: str, *, fetch_author: bool = False, fetch_genres: bool = False
    ) -> Book:
        pass


class AuthorRepository(ABC):
    @abstractmethod
    def get_author_by_id(
        self, author_id: str, *, fetch_books: bool = False, fetch_books_genres=False
    ) -> Author:
        pass
