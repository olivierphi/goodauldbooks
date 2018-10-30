import typing as t


class Book(t.NamedTuple):
    gutenberg_id: int
    title: str


class Author(t.NamedTuple):
    gutenberg_id: int
    name: str
    first_name: str = None
    last_name: str = None
    birth_year: int = None
    death_year: int = None
