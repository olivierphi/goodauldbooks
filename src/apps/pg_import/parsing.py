import json
import re
import typing as t
from enum import Enum
from pathlib import Path


class BookAssetType(Enum):
    EPUB = "epub"
    MOBI = "mobi"
    TXT = "txt"
    COVER = "cover"


DEFAULT_BOOK_INTRO_LENGTH = 5000

BOOK_ASSETS_FILES_TYPES: t.Dict[BookAssetType, t.Pattern] = {
    BookAssetType.EPUB: re.compile("^pg\d+-images\.epub$"),
    BookAssetType.COVER: re.compile("^pg\d+\.cover\.medium\.jpg$"),
    BookAssetType.MOBI: re.compile("^pg\d+-images\.mobi$"),
    BookAssetType.TXT: re.compile("^pg\d+\.txt\.utf8$"),
}


class BookAsset(t.NamedTuple):
    size: int
    type: BookAssetType
    path: Path


class BookProcessingResult(t.NamedTuple):
    book_id: str
    rdf_file_content: str
    assets: t.Dict[BookAssetType, BookAsset]
    intro: t.Union[str, None]

    def assets_as_json(self, books_root_path: Path) -> str:
        assets_as_simple_structures = {
            asset_type.value: {
                "path": str(data.path.relative_to(books_root_path)),
                "size": data.size,
            }
            for (asset_type, data) in self.assets.items()
        }
        return json.dumps(assets_as_simple_structures)


def process_book_from_pg_rdf_file(
    pg_book_id: str, rdf_file: Path
) -> t.Optional[BookProcessingResult]:
    rdf_file_dir = rdf_file.parent
    assets = get_pg_book_assets(rdf_file_dir)

    if BookAssetType.EPUB not in assets:
        # Allowing people to download books in epub format is our top priority,
        # so we don't handle PG items that don't have an epub file
        return None

    rdf_file_content = rdf_file.read_text(encoding="utf-8")

    book_intro: t.Optional[
        str
    ] = None if BookAssetType.TXT not in assets else get_book_intro(
        assets[BookAssetType.TXT].path
    )

    result = BookProcessingResult(
        book_id=pg_book_id,
        rdf_file_content=rdf_file_content,
        assets=assets,
        intro=book_intro,
    )

    return result


def get_book_intro(
    book_as_txt: Path, intro_length: int = DEFAULT_BOOK_INTRO_LENGTH
) -> str:
    with open(book_as_txt, "r", encoding="utf-8") as f:
        return f.read(intro_length)


def get_pg_book_assets(rdf_file_dir: Path) -> t.Dict[BookAssetType, BookAsset]:
    assets = {}
    for sibling in rdf_file_dir.iterdir():
        for asset_type, pattern in BOOK_ASSETS_FILES_TYPES.items():
            if pattern.fullmatch(sibling.name):
                book_asset = BookAsset(
                    type=asset_type, size=sibling.stat().st_size, path=sibling.resolve()
                )
                assets[asset_type] = book_asset
    return assets
