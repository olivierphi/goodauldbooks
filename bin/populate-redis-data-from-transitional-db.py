import sqlite3
import sys
import time

from _import_common import init_import_logging

from infra.redis import redis_host, redis_client
from library.domain import Book
from library_import.gutenberg.transitional_db import parse_books_from_transitional_db
from library_import.redis import store_book_in_redis, compute_books_by_genre
from walrus import Database

sqlite_db_path_str = sys.argv[1]
db_con = sqlite3.connect(sqlite_db_path_str)

nb_books_in_db = db_con.execute("select count(*) from raw_book").fetchone()[0]
if nb_books_in_db == 0:
    print("No books round in 'raw_book' SQLite table. Exiting.")
    sys.exit(1)

autocomplete_db = Database(redis_host).autocomplete()

start_time = time.monotonic()
nb_books_parsed = 0

print(
    f"Starting parsing and storage (in Redis) of {nb_books_in_db} books from the SQLite database."
)


def _on_book_parsed(book: Book):
    global nb_books_parsed

    store_book_in_redis(redis_client, autocomplete_db, book)

    nb_books_parsed += 1

    if nb_books_parsed % 100 == 0:
        percent = round(nb_books_parsed * 100 / nb_books_in_db)
        duration = round(time.monotonic() - start_time, 1)
        print(
            f"{str(percent).rjust(3)}% - {nb_books_parsed} books parsed ({duration}s)...",
            end="\r",
            flush=True,
        )


init_import_logging()

nb_pg_rdf_files_found = parse_books_from_transitional_db(db_con, _on_book_parsed)

duration = round(time.monotonic() - start_time, 1)
print(
    f"\n{nb_pg_rdf_files_found} books parsed from raw data in DB, and injected into Redis, in {duration}s."
)

start_time = time.monotonic()
print("Now computing the 'library:books_by:genre:[genre_hash]' sets...")
compute_books_by_genre(redis_client)
duration = round(time.monotonic() - start_time, 1)
print(f"'Books by genre' sorted sets computed. ({duration}s.)")
