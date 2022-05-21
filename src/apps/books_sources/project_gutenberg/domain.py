import typing as t


class BookToParse(t.NamedTuple):
    pg_book_id: int
    rdf_content: str
    assets_sizes: dict[str, int]
    has_intro: bool
    has_cover: bool
    intro: t.Optional[str] = None
