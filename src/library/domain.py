import typing as t
from enum import Enum

LANG_ALL = "_all_"


class BookAssetType(Enum):
    EPUB = "epub"
    MOBI = "mobi"


class BookAsset(t.NamedTuple):
    type: BookAssetType
    size: int


class Author(t.NamedTuple):
    provider: str
    id: str
    name: str
    first_name: str = None
    last_name: str = None
    birth_year: int = None
    death_year: int = None

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
    lang: str
    genres: t.List[str]
    assets: t.List[BookAsset]
    authors: t.List[Author]
