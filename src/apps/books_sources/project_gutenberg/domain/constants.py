from typing import Final

from apps.library.domain.types import BookAssetType

SOURCE_ID = "pg"

BOOK_INTRO_SIZE: Final = 5000

BOOK_ASSET_SUFFIXES: Final = {f".{asset_type}" for asset_type in BookAssetType.__args__}  # type: ignore

GUTENBERG_XML_NAMESPACES = {
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "dcterms": "http://purl.org/dc/terms/",
    "pgterms": "http://www.gutenberg.org/2009/pgterms/",
}
