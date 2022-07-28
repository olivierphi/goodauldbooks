import sqlite3
import time
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from ... import logger
from ...domain.mutations import index_collection_in_db


class Command(BaseCommand):
    help = "Traverses a Project Gutenberg rsync-ed 'generated' collection and dump its content to a SQLite database"

    def add_arguments(self, parser):
        parser.add_argument("pg_collection_path", type=Path)
        parser.add_argument("sqlite_db_path", type=Path)
        parser.add_argument("--traversal-limit", type=int)

    def handle(self, *args, pg_collection_path: Path, sqlite_db_path: Path, traversal_limit: int, **options):  # type: ignore
        if not pg_collection_path.is_dir():
            raise CommandError(f"Project Gutenberg generated collection path '{pg_collection_path}' is invalid.")
        if not sqlite_db_path.parent.is_dir():
            raise CommandError(f"Transitional SQLite database folder path '{sqlite_db_path.parent}' is invalid.")

        start_time = time.monotonic()
        db_con = sqlite3.connect(str(sqlite_db_path))

        def _on_book_batch_stored(current_books_stored_count: int) -> None:
            duration = round(time.monotonic() - start_time, 1)
            logger.info(f"{current_books_stored_count} books stored. In progress... ({duration}s)")

        books_processed_count, books_stored_count = index_collection_in_db(
            collection_path=pg_collection_path,
            db_con=db_con,
            traversal_limit=traversal_limit,
            on_book_batch_stored=_on_book_batch_stored,
            db_create_schema=True,
            db_destroy_schema_first=True,
        )

        self.stdout.write(
            f"\n\n{books_processed_count} books found and {books_stored_count} stored in DB in {round(time.monotonic() - start_time, 1)}s."
        )
