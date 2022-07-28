import sqlite3
from pathlib import Path
from typing import Callable, NamedTuple, TypeAlias

import orjson

from ... import logger
from ...sql import RAW_BOOKS_DB_SQL_INSERT, RAW_BOOKS_DB_SQL_TABLE_CREATION, RAW_BOOKS_DB_SQL_TABLE_DROP
from ..books_filtering import is_book_satisfying_filters
from ..queries import get_book_to_parse_from_book_rdf, traverse_collection
from ..types import BookToParse

_RAW_BOOKS_STORAGE_IN_DB_BATCH_SIZE = 100

OnBookBatchStored: TypeAlias = Callable[[int], None]


class CollectionIndexingResult(NamedTuple):
    books_processed_count: int
    books_stored_count: int


def index_collection_in_db(
    *,
    collection_path: Path,
    db_con: sqlite3.Connection,
    db_create_schema: bool,
    db_destroy_schema_first: bool,
    on_book_batch_stored: OnBookBatchStored = None,
    traversal_limit: int = 0,
) -> CollectionIndexingResult:
    if db_create_schema or db_destroy_schema_first:
        if db_destroy_schema_first:
            db_con.execute(RAW_BOOKS_DB_SQL_TABLE_DROP)
        _init_books_transitional_db(db_con)

    books_processed_count = books_stored_count = 0

    current_books_raw_data_batch: list[BookToParse] = []

    def _on_book_rdf(pg_book_id: int, rdf_file_path: Path):
        nonlocal current_books_raw_data_batch, books_processed_count, books_stored_count

        book_to_parse = get_book_to_parse_from_book_rdf(pg_book_id=pg_book_id, rdf_file_path=rdf_file_path)
        append_book = True
        book_satisfies_filter = is_book_satisfying_filters(book_to_parse)
        if not book_satisfies_filter:
            append_book = False
            logger.info("%s:skipped_by_filter", str(pg_book_id).rjust(5))
        if append_book:
            current_books_raw_data_batch.append(book_to_parse)
            books_stored_count += 1
        books_processed_count += 1

        if len(current_books_raw_data_batch) == _RAW_BOOKS_STORAGE_IN_DB_BATCH_SIZE:
            _save_books_batch_to_db()

    def _save_books_batch_to_db():
        _store_raw_books_to_parse_batch_in_transitional_db(current_books_raw_data_batch, db_con)
        if on_book_batch_stored:
            on_book_batch_stored(books_stored_count)
        current_books_raw_data_batch.clear()

    traverse_collection(
        base_folder=collection_path,
        on_book_rdf=_on_book_rdf,
        traversal_limit=traversal_limit,
    )

    _save_books_batch_to_db()

    return CollectionIndexingResult(books_processed_count, books_stored_count)


def _init_books_transitional_db(db_con: sqlite3.Connection) -> None:
    db_con.execute(RAW_BOOKS_DB_SQL_TABLE_CREATION)


def _store_raw_books_to_parse_batch_in_transitional_db(
    books_raw_data: list[BookToParse], db_con: sqlite3.Connection
) -> None:
    books_data_for_sql = (_get_book_values_for_sql(book_raw_data) for book_raw_data in books_raw_data)

    db_con.executemany(RAW_BOOKS_DB_SQL_INSERT, books_data_for_sql)
    db_con.commit()


def _get_book_values_for_sql(book_raw_data: BookToParse) -> dict:
    return {
        **book_raw_data,
        "assets_sizes": orjson.dumps(book_raw_data["assets_sizes"]),
        "has_intro": int(book_raw_data["has_intro"]),
        "intro": book_raw_data["intro"] if book_raw_data["has_intro"] else None,
        "has_cover": int(book_raw_data["has_cover"]),
    }
