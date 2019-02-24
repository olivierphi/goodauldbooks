import sqlite3
import time
import logging
from functools import partial
from pathlib import Path

from django.core.management import BaseCommand, CommandError
from django.db import connection

from app.library import domain as library_domain
from ...gutenberg import transitional_db, postgres_population, logger


class Command(BaseCommand):
    help = "Store raw books from the transitional SQLite db into our 'real' Postgres database"

    def add_arguments(self, parser):
        parser.add_argument("sqlite_db_path", type=str)
        parser.add_argument("--limit", type=int, dest="limit")
        parser.add_argument(
            "--truncate",
            action="store_true",
            dest="truncate",
            help="truncate Postgres database first",
        )

    def handle(self, *args, **options):
        sqlite_db_path = Path(options["sqlite_db_path"])
        if not sqlite_db_path.is_file():
            raise CommandError(
                f"Transitional SQLite database path '{sqlite_db_path}' is invalid."
            )

        db_con = sqlite3.connect(str(sqlite_db_path))

        nb_books_in_db = db_con.execute("select count(*) from raw_book").fetchone()[0]
        if nb_books_in_db == 0:
            self.stdout.write("No books round in 'raw_book' SQLite table. Exiting.")
            return

        if options["truncate"]:
            self.stdout.write("Truncating existing Postgres data first...")
            with connection.cursor() as cursor:
                for sql in (
                    "truncate book cascade",
                    "truncate genre cascade",
                    "truncate author cascade",
                ):
                    cursor.execute(sql)
            self.stdout.write("Truncated.")

        start_time = time.monotonic()
        on_book_parsed = partial(
            _on_book_parsed,
            nb_books_in_db=nb_books_in_db,
            start_time=start_time,
            logger=logger,
        )
        nb_pg_rdf_files_found = transitional_db.parse_books_from_transitional_db(
            db_con, on_book_parsed, limit=options["limit"] or None
        )
        duration = round(time.monotonic() - start_time, 1)
        self.stdout.write(
            f"\n{nb_pg_rdf_files_found} books parsed from raw data in SQLite DB and injected into Postgres, in {duration}s."
        )


nb_books_parsed = 0


def _on_book_parsed(
    book: library_domain.Book,
    *,
    nb_books_in_db: int,
    start_time: float,
    logger: logging.Logger,
) -> None:
    global nb_books_parsed

    nb_books_parsed += 1

    postgres_population.save_book_in_db(book)

    if nb_books_parsed % 100 == 0:
        percent = round(nb_books_parsed * 100 / nb_books_in_db)
        duration = round(time.monotonic() - start_time, 1)
        logger.info(
            f"{str(percent).rjust(3)}% - {nb_books_parsed} books parsed ({duration}s)..."
        )
