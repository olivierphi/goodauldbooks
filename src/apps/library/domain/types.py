from typing import Literal, NamedTuple

BookAssetType = Literal["epub", "mobi", "txt"]


class BookAsset(NamedTuple):
    type: BookAssetType
    size: int


class Author(NamedTuple):
    provider: str
    id: str
    name: str
    first_name: str | None = None
    last_name: str | None = None
    birth_year: int | None = None
    death_year: int | None = None

    def full_name(self) -> str:
        res = []
        if self.first_name:
            res.append(self.first_name)
        if self.last_name:
            res.append(self.last_name)
        return " ".join(res)


class Book(NamedTuple):
    provider: str
    id: str
    title: str
    subtitle: str
    lang: str
    genres: list[str]
    assets: list[BookAsset]
    authors: list[Author]
    intro: str | None
