from __future__ import annotations

from typing import TypedDict


class BookToParse(TypedDict):
    pg_book_id: int
    rdf_content: str
    assets_sizes: dict[str, int]
    has_intro: bool
    has_cover: bool
    intro: str | None
