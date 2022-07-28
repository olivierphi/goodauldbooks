import sqlite3
from typing import Callable, NamedTuple, TypeAlias

import orjson
from django.db import IntegrityError

from apps.library.models import Author, Book, Genre

from ... import logger
from ...sql import RAW_BOOKS_DB_SQL_SELECT
from ..queries import LibraryBookData, get_library_book_from_raw_pg_book
from ..types import BookToParse

_BATCH_SIZE = 200

OnBookBatchInjected: TypeAlias = Callable[[int], None]


class CollectionInjectionResult(NamedTuple):
    books_processed_count: int
    books_injected_count: int


def inject_generated_collection_index_into_library(
    *,
    db_con: sqlite3.Connection,
    batch_size: int = _BATCH_SIZE,
    traversal_limit: int = 0,
    on_book_batch_injected: OnBookBatchInjected = None,
    db_truncate_first: bool = False,
) -> CollectionInjectionResult:
    if db_truncate_first:
        _truncate_library()

    sql = RAW_BOOKS_DB_SQL_SELECT
    if traversal_limit:
        # no SQL injection risk in this case, we're in total control of that parameter :-)
        sql += f" limit {int(traversal_limit)}"

    current_batch: list[LibraryBookData] = []

    books_processed_count = books_injected_count = 0

    def _save_books_batch_to_db():
        nonlocal books_injected_count
        # N.B. `bulk_create()` doesn't work with many-to-many relationships so let's do this one by one:
        for library_data in current_batch:
            _save_data_to_library(library_data)

        books_injected_count += len(current_batch)
        if on_book_batch_injected:
            on_book_batch_injected(books_injected_count)
        current_batch.clear()

    for row in db_con.execute(sql):
        book_to_parse = BookToParse(
            pg_book_id=row[0],
            rdf_content=row[1],
            assets_sizes=orjson.loads(row[2]),
            has_intro=bool(row[3]),
            intro=row[4],
            has_cover=bool(row[5]),
        )
        book_library_data = get_library_book_from_raw_pg_book(raw_book=book_to_parse)
        books_processed_count += 1

        if not book_library_data:
            continue

        current_batch.append(book_library_data)

        if len(current_batch) == batch_size:
            _save_books_batch_to_db()

    if current_batch:
        _save_books_batch_to_db()

    return CollectionInjectionResult(books_processed_count, books_injected_count)


# For Authors we need to maintain a "slug -> auto-incremented ID" mapping...
_created_author_ids_cache: dict[str, int] = {}
# ... But for literary Genres we just need to maintain a list of IDs, since we're generating them deterministically:
_created_genre_ids_cache: list[int] = []


def _save_data_to_library(library_data: LibraryBookData):
    global _author_ids_cache

    book, authors, genres = library_data
    book.save()

    author_ids: list[int] = []
    for author in authors:
        try:
            author_ids.append(_created_author_ids_cache[author.public_id])
            continue
        except KeyError:
            pass

        try:
            author.save(force_insert=True)
            author_id = author.id
        except IntegrityError:
            author_id = Author.objects.values_list("id").get(public_id=author.public_id)[0]
        _created_author_ids_cache[author.public_id] = author_id
        author_ids.append(author.id)
    book.authors.set(author_ids)

    # It's a bit simpler for literary Genres, since *we* set their primary key
    genre_ids: list[int] = []
    for genre in genres:
        if genre.id in _created_genre_ids_cache:
            continue
        try:
            genre.save(force_insert=True)
        except IntegrityError:
            pass
        _created_genre_ids_cache.append(genre.id)
        genre_ids.append(genre.id)
    book.genres.set(genre_ids)


def _truncate_library():
    logger.info("Deleting all existing data from the library first...")
    Author.objects.all().delete()
    Book.objects.all().delete()
    Genre.objects.all().delete()
    logger.info("Existing data from the library deleted.")
