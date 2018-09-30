import typing as t

from library.models import Author, Book

DEFAULT_LIMIT = 10
MAX_LIMIT = 15


class PaginationRequest(t.NamedTuple):
    page: int = 1
    nb_per_page: int = DEFAULT_LIMIT


class GetBookByIdQuery(t.NamedTuple):
    book_id: str
    fetch_author: bool = False
    fetch_genres: bool = False


class GetBooksQuery(t.NamedTuple):
    author_id: t.Optional[str] = None
    genre: t.Optional[str] = None
    pagination: t.Optional[PaginationRequest] = None
    fetch_author: bool = False
    fetch_genres: bool = False


class GetAuthorByIdQuery(t.NamedTuple):
    author_id: str
    fetch_books: bool = False
    fetch_books_genres: bool = False
