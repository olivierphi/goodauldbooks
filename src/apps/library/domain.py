from abc import ABC, abstractmethod
import typing as t

from library.models import Author, Book

DEFAULT_LIMIT = 10
MAX_LIMIT = 15


class PaginationRequest(t.NamedTuple):
    page: int = 1
    nb_per_page: int = DEFAULT_LIMIT


class BookRepository(ABC):
    @abstractmethod
    def get_book_by_id(
        self, book_id: str, *, fetch_author: bool = False, fetch_genres: bool = False
    ) -> Book:
        pass

    @abstractmethod
    def get_books(
        self,
        *,
        author_id: t.Optional[str] = None,
        genre: t.Optional[str] = None,
        pagination: t.Optional[PaginationRequest] = None,
        fetch_author: bool = False,
        fetch_genres: bool = False,
    ) -> t.List[Book]:
        pass


class AuthorRepository(ABC):
    @abstractmethod
    def get_author_by_id(
        self, author_id: str, *, fetch_books: bool = False, fetch_books_genres=False
    ) -> Author:
        pass
