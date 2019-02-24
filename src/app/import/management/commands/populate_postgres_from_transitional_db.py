import sqlite3
import time
import logging
from functools import partial
from pathlib import Path

from django.core.management import BaseCommand, CommandError

from app.library.domain import Book, Author
from ...gutenberg import transitional_db, logger
from app.library import models as library_models, helpers as library_helpers


class Command(BaseCommand):
    help = "Store raw books from the transitional SQLite db into our 'real' Postgres database"

    def add_arguments(self, parser):
        parser.add_argument("sqlite_db_path", type=str)
        parser.add_argument("--limit", type=int, dest="limit")

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
    book: Book, *, nb_books_in_db: int, start_time: float, logger: logging.Logger
) -> None:
    global nb_books_parsed

    nb_books_parsed += 1

    _save_book_in_db(book)

    if nb_books_parsed % 100 == 0:
        percent = round(nb_books_parsed * 100 / nb_books_in_db)
        duration = round(time.monotonic() - start_time, 1)
        logger.info(
            f"{str(percent).rjust(3)}% - {nb_books_parsed} books parsed ({duration}s)..."
        )


def _save_book_in_db(book: Book) -> library_models.Book:
    book_entity = library_models.Book(
        public_id=f"{book.provider}:{book.id}", title=book.title, lang=book.lang
    )
    book_entity.save()

    if book.authors:
        for author in book.authors:
            author_entity = _save_author_in_db(author)
            book_entity.authors.add(author_entity)

    if book.genres:
        for genre_name in book.genres:
            genre_entity = _save_genre_in_db(genre_name)
            book_entity.genres.add(genre_entity)

    return book_entity


def _save_author_in_db(author: Author) -> library_models.Author:
    author_id = f"{author.provider}:{author.id}"
    author_already_exists = library_models.Author.objects.filter(
        public_id=author_id
    ).exists()

    if author_already_exists:
        return library_models.Author.objects.get(public_id=author_id)

    author_entity = library_models.Author(
        public_id=author_id,
        first_name=author.first_name,
        last_name=author.last_name,
        birth_year=author.birth_year,
        death_year=author.death_year,
    )
    author_entity.save()

    return author_entity


def _save_genre_in_db(genre_name: str) -> library_models.Genre:
    genre_id = library_helpers.get_genre_as_int(genre_name)
    genre_already_exists = library_models.Genre.objects.filter(id=genre_id).exists()

    if genre_already_exists:
        return library_models.Genre.objects.get(id=genre_id)

    genre_entity = library_models.Genre(id=genre_id, name=genre_name)
    genre_entity.save()

    return genre_entity
