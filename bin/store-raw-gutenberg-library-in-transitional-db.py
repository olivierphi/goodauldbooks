import re
import sqlite3
import sys
from pathlib import Path

from _import_common import init_import_logging

from library_import.gutenberg import BookToParse

EPUB_FILE_REGEX = re.compile("^pg(\d+)\.epub$")
RDF_CONTENT_PATTERNS_BLACKLIST = (
    re.compile("<rdf:value>AP</rdf:value>"),
    re.compile("<pgterms:name>Library of Congress. Copyright Office</pgterms:name>"),
)


def filter_book(book_to_parse: BookToParse) -> bool:
    def has_epub() -> bool:
        dir_files_sizes = book_to_parse.dir_files_sizes
        for file_name in dir_files_sizes.keys():
            if EPUB_FILE_REGEX.match(file_name):
                return True
        return False

    def is_blacklisted() -> bool:
        for blacklist_pattern in RDF_CONTENT_PATTERNS_BLACKLIST:
            if blacklist_pattern.match(book_to_parse.rdf_content):
                return True
        return False

    if not has_epub():
        return False
    if is_blacklisted():
        return False

    return True


def store_raw_gutenberg_library_in_transitional_db(
    base_folder: Path, sqlite_db_path: Path
) -> int:
    from library_import.gutenberg import transitional_db

    if sqlite_db_path.exists():
        sqlite_db_path.unlink()
    db_con = sqlite3.connect(str(sqlite_db_path))

    transitional_db.init_books_transitional_db(db_con)

    nb_books_stored = 0

    def on_book_batch_stored(nb_books_in_batch: int) -> None:
        nonlocal nb_books_stored
        nb_books_stored += nb_books_in_batch
        duration = round(time.monotonic() - start_time, 1)
        print(
            f"{nb_books_stored} books stored. In progress... ({duration}s)",
            end="\r",
            flush=True,
        )

    transitional_db.traverse_library_and_store_raw_data_in_db(
        base_folder, db_con, filter_book, on_book_batch_stored
    )

    return db_con.execute("select count(*) from raw_book").fetchone()[0]


if __name__ == "__main__":
    import time

    base_folder_str = sys.argv[1]
    base_folder = Path(base_folder_str)
    sqlite_db_path_str = sys.argv[2]
    sqlite_db_path = Path(sqlite_db_path_str)

    init_import_logging()

    start_time = time.monotonic()

    nb_pg_rdf_files_found = store_raw_gutenberg_library_in_transitional_db(
        base_folder, sqlite_db_path
    )

    print(
        f"\n\n{nb_pg_rdf_files_found} books found and stored in DB in {round(time.monotonic() - start_time, 1)}s."
    )
