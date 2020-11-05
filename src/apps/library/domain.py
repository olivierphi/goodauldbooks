import typing as t
from enum import Enum
from dataclasses import dataclass

LANG_ALL = "_all_"


class BookAssetType(Enum):
    EPUB = "epub"
    MOBI = "mobi"


@dataclass
class BookAsset:
    type: BookAssetType
    size: int


@dataclass
class Author:
    provider: str
    id: str
    name: str
    first_name: str = None
    last_name: str = None
    birth_year: int = None
    death_year: int = None


@dataclass
class Book:
    provider: str
    id: str
    title: str
    subtitle: t.Optional[str]
    lang: str
    genres: t.List[str]
    assets: t.List[BookAsset]
    authors: t.List[Author]
    intro: t.Optional[str]
