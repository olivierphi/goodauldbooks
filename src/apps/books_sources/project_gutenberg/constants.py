import typing as t

from apps.library.domain import BookAssetType

SOURCE_ID = "pg"

BOOK_INTRO_SIZE: t.Final = 5000

BOOK_ASSET_SUFFIXES: t.Final = {f".{asset_type.value}" for asset_type in BookAssetType}
