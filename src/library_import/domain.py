import typing as t
from enum import Enum


class BookAssetType(Enum):
    EPUB = "epub"
    MOBI = "mobi"


class BookAsset(t.NamedTuple):
    type: BookAssetType
    size: int


class Book(t.NamedTuple):
    gutenberg_id: int
    title: str
    lang: str
    genres: t.List[str]
    assets: t.List[BookAsset]


class Author(t.NamedTuple):
    gutenberg_id: int
    name: str
    first_name: str = None
    last_name: str = None
    birth_year: int = None
    death_year: int = None
