import typing as t
from enum import Enum


class BookAssetType(Enum):
    EPUB = "epub"
    MOBI = "mobi"
    TXT = "txt"


class BookAsset(t.NamedTuple):
    type: BookAssetType
    size: int


class Author(t.NamedTuple):
    provider: str
    id: str
    name: str
    first_name: t.Optional[str] = None
    last_name: t.Optional[str] = None
    birth_year: t.Optional[int] = None
    death_year: t.Optional[int] = None

    def full_name(self) -> str:
        res = []
        if self.first_name:
            res.append(self.first_name)
        if self.last_name:
            res.append(self.last_name)
        return " ".join(res)


class Book(t.NamedTuple):
    provider: str
    id: str
    title: str
    subtitle: str
    lang: str
    genres: list[str]
    assets: list[BookAsset]
    authors: list[Author]
    intro: t.Optional[str]
