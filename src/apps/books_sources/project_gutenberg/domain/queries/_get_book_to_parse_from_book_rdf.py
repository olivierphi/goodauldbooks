from pathlib import Path

from ..constants import BOOK_INTRO_SIZE
from ..types import BookToParse


def get_book_to_parse_from_book_rdf(*, pg_book_id: int, rdf_file_path: Path) -> BookToParse:
    rdf_content = rdf_file_path.read_text()

    assets_sizes = {file.name: file.stat().st_size for file in rdf_file_path.parent.iterdir()}

    intro_file_path: Path = rdf_file_path.parent / f"pg{pg_book_id}.txt.utf8"
    has_intro = intro_file_path.exists()
    if has_intro:
        with intro_file_path.open("rt", encoding="utf8") as intro_file:
            intro = intro_file.read(BOOK_INTRO_SIZE)
    else:
        intro = None

    cover_file_path: Path = rdf_file_path.parent / f"pg{pg_book_id}.cover.medium.jpg"
    has_cover = cover_file_path.exists()

    return BookToParse(
        pg_book_id=pg_book_id,
        rdf_content=rdf_content,
        assets_sizes=assets_sizes,
        has_intro=has_intro,
        intro=intro,
        has_cover=has_cover,
    )
