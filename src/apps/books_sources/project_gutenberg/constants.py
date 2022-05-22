import typing as t

from apps.library.domain import BookAssetType

SOURCE_ID = "pg"

BOOK_INTRO_SIZE: t.Final = 5000

BOOK_ASSET_SUFFIXES: t.Final = {f".{asset_type.value}" for asset_type in BookAssetType}

GUTENBERG_XML_NAMESPACES = {
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "dcterms": "http://purl.org/dc/terms/",
    "pgterms": "http://www.gutenberg.org/2009/pgterms/",
}
