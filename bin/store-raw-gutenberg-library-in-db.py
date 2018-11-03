import re
import sqlite3
import sys
from pathlib import Path

from _import_common import init_path, init_import_logging

init_path()

EPUB_FILE_REGEX = re.compile("^pg(\d+)\.epub$")
RDF_CONTENT_PATTERNS_BLACKLIST = (
    re.compile("<rdf:value>AP</rdf:value>"),
    re.compile("<pgterms:name>Library of Congress. Copyright Office</pgterms:name>"),
)


def filter_book(book_raw_data: dict) -> bool:
    def has_epub() -> bool:
        dir_content = book_raw_data["dir_content"]
        for dir_item in dir_content:
            if EPUB_FILE_REGEX.match(dir_item["name"]):
                return True
        return False

    def is_blacklisted() -> bool:
        for blacklist_pattern in RDF_CONTENT_PATTERNS_BLACKLIST:
            if blacklist_pattern.match(book_raw_data["rdf_content"]):
                return True
        return False

    if not has_epub():
        return False
    if is_blacklisted():
        return False

    return True


def store_raw_gutenberg_library_in_db(base_folder: Path, sqlite_db_path: Path) -> int:
    from library_import import pg_import

    if sqlite_db_path.exists():
        sqlite_db_path.unlink()
    db_con = sqlite3.connect(str(sqlite_db_path))

    pg_import.init_raw_books_db(db_con)

    nb_books_stored = 0

    def on_book_batch_stored(nb_books_in_batch: int) -> None:
        nonlocal nb_books_stored
        nb_books_stored += nb_books_in_batch
        print(f"{nb_books_stored} books stored. In progress...", end="\r", flush=True)

    pg_import.traverse_library_and_store_raw_data_in_db(
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

    nb_pg_rdf_files_found = store_raw_gutenberg_library_in_db(
        base_folder, sqlite_db_path
    )

    print(
        f"\n\n{nb_pg_rdf_files_found} books found and stored in DB in {round(time.monotonic() - start_time, 1)}s."
    )
