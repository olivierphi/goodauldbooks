from pathlib import Path
from pprint import pprint
import sqlite3
import typing as t

from django.core.management import BaseCommand, CommandError

from app.library.domain import Book
from ...gutenberg import parse_book


class Command(BaseCommand):
    help = (
        "Parse some test books from the transitional SQLite db, and display the result"
    )

    def add_arguments(self, parser):
        parser.add_argument("sqlite_db_path", type=str)

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

        for pg_book_id in (84, 345, 1000, 10000, 10001):
            book = _parse_book_from_db(db_con, pg_book_id)
            book.intro = None if not book.intro else f"INTRO:[...]{book.intro[-20:]}"
            pprint(book)


def _parse_book_from_db(
    db_con: sqlite3.Connection, gutenberg_id: int
) -> t.Optional[Book]:
    import json

    from ...gutenberg import BookToParse

    db_con.row_factory = sqlite3.Row
    raw_book_row = db_con.execute(
        "select * from raw_book where pg_book_id = ?", [gutenberg_id]
    ).fetchone()

    book_to_parse = BookToParse(
        pg_book_id=raw_book_row["pg_book_id"],
        rdf_content=raw_book_row["rdf_content"],
        dir_files_sizes=json.loads(raw_book_row["dir_files_sizes"]),
        has_intro=bool(raw_book_row["has_intro"]),
        intro=raw_book_row["intro"] if raw_book_row["has_intro"] else None,
        has_cover=bool(raw_book_row["has_cover"]),
    )
    book = parse_book(book_to_parse)

    return book
