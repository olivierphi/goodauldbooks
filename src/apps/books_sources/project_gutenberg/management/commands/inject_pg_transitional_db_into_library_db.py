import sqlite3
import time
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from ... import logger
from ...domain.mutations import inject_generated_collection_index_into_library


class Command(BaseCommand):
    help = "Inject the data of a Project Gutenberg rsync-ed 'generated' collection dumped into a SQLite database into our Library DB"

    def add_arguments(self, parser):
        parser.add_argument("sqlite_db_path", type=Path)
        parser.add_argument("--traversal-limit", type=int)
        parser.add_argument("--db-truncate-first", action="store_true")

    def handle(self, *args, sqlite_db_path: Path, traversal_limit: int, db_truncate_first: bool, **options):  # type: ignore
        if not sqlite_db_path.is_file():
            raise CommandError(f"Could not find a transitional SQLite database at path '{sqlite_db_path}'.")

        start_time = time.monotonic()
        db_con = sqlite3.connect(str(sqlite_db_path))

        def _on_book_batch_injected(current_books_injected_count: int) -> None:
            duration = round(time.monotonic() - start_time, 1)
            logger.info(f"{current_books_injected_count} books injected. In progress... ({duration}s)")

        books_processed_count, books_injected_count = inject_generated_collection_index_into_library(
            db_con=db_con,
            traversal_limit=traversal_limit,
            on_book_batch_injected=_on_book_batch_injected,
            db_truncate_first=db_truncate_first,
        )

        self.stdout.write(
            f"\n\n{books_processed_count} books found and {books_injected_count} injected in DB in {round(time.monotonic() - start_time, 1)}s."
        )
