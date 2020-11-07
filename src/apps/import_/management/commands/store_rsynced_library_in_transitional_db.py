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
        parser.add_argument("--limit", type=int, dest="limit")

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
            pg_collection_path,
            sqlite_db_path,
            limit=options["limit"] or None,
            start_time=start_time,
            logger=logger,
        )

        self.stdout.write(
            f"\n\n{nb_pg_rdf_files_found} books found and stored in DB in {round(time.monotonic() - start_time, 1)}s."
        )
