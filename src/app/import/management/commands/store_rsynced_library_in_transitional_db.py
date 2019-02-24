import logging
import re
import sqlite3
import time
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from ...gutenberg import BookToParse, transitional_db, logger


class Command(BaseCommand):
    help = "Traverses a Project Gutenberg rsync-ed 'generated' collection and dump its content to a SQLite database"

    def add_arguments(self, parser):
        parser.add_argument("pg_collection_path", type=str)
        parser.add_argument("sqlite_db_path", type=str)

    def handle(self, *args, **options):
        pg_collection_path = Path(options["pg_collection_path"])
        if not pg_collection_path.is_dir():
            raise CommandError(
                f"Project Gutenberg generated collection path '{pg_collection_path}' is invalid."
            )
        sqlite_db_path = Path(options["sqlite_db_path"])
        if not sqlite_db_path.parent.is_dir():
            raise CommandError(
                f"Transitional SQLite database folder path '{sqlite_db_path.parent}' is invalid."
            )

        start_time = time.monotonic()
        nb_pg_rdf_files_found = store_raw_gutenberg_library_in_transitional_db(
            pg_collection_path, sqlite_db_path, start_time=start_time, logger=logger
        )

        self.stdout.write(
            f"\n\n{nb_pg_rdf_files_found} books found and stored in DB in {round(time.monotonic() - start_time, 1)}s."
        )


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
    pg_collection_path: Path,
    sqlite_db_path: Path,
    *,
    start_time: float,
    logger: logging.Logger,
) -> int:
    if sqlite_db_path.exists():
        sqlite_db_path.unlink()
    db_con = sqlite3.connect(str(sqlite_db_path))

    transitional_db.init_books_transitional_db(db_con)

    nb_books_stored = 0

    def on_book_batch_stored(nb_books_in_batch: int) -> None:
        nonlocal nb_books_stored
        nb_books_stored += nb_books_in_batch
        duration = round(time.monotonic() - start_time, 1)
        logger.info(f"{nb_books_stored} books stored. In progress... ({duration}s)")

    transitional_db.traverse_library_and_store_raw_data_in_db(
        pg_collection_path, db_con, filter_book, on_book_batch_stored
    )

    return db_con.execute("select count(*) from raw_book").fetchone()[0]
