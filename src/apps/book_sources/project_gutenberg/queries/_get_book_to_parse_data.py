from pathlib import Path
from .. import domain


def get_book_to_parse_data(pg_book_id: int, rdf_path: Path) -> domain.BookToParse:
    rdf_content = rdf_path.read_text()

    dir_files_sizes = {
        file.name: file.stat().st_size for file in rdf_path.parent.iterdir()
    }

    intro_file_path: Path = rdf_path.parent / f"pg{pg_book_id}.txt.utf8"
    has_intro = intro_file_path.exists()
    if has_intro:
        with intro_file_path.open() as intro_file:
            intro = intro_file.read(domain.BOOK_INTRO_SIZE)
    else:
        intro = None

    cover_file_path: Path = rdf_path.parent / f"pg{pg_book_id}.cover.medium.jpg"
    has_cover = cover_file_path.exists()

    return domain.BookToParse(
        pg_book_id=pg_book_id,
        rdf_content=rdf_content,
        dir_files_sizes=dir_files_sizes,
        has_intro=has_intro,
        intro=intro,
        has_cover=has_cover,
    )
