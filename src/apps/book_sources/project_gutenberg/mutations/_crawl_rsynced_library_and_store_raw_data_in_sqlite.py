import json
from pathlib import Path
import sqlite3
import typing as t

from .. import domain, _logger, queries

OnBookBatchStored = t.Callable[[int, Path], t.Any]

CRAWLING_LIMIT: int = 0

_DEFAULT_DB_BATCH_SIZE = 1000


_RAW_BOOKS_DB_SQL_INSERT = """\
insert into raw_book
    (pg_book_id, rdf_content, dir_files_sizes, has_intro, intro, has_cover)
values
    (:pg_book_id, :rdf_content, :dir_files_sizes, :has_intro, :intro, :has_cover);
"""


def crawl_rsynced_library_and_store_raw_data_in_sqlite(
    *,
    base_folder: Path,
    db_con: sqlite3.Connection,
    filter_func: t.Optional[domain.BookToParseFilterFunc] = None,
    on_book_batch_stored: t.Optional[OnBookBatchStored] = None,
    limit: t.Optional[int] = None,
    batch_size: t.Optional[int] = None,
) -> int:
    nb_books_processed = 0

    if batch_size is None:
        batch_size = _DEFAULT_DB_BATCH_SIZE

    current_books_raw_data_batch: t.List[domain.BookToParse] = []

    def _on_book_rdf(pg_book_id: int, rdf_path: Path):
        nonlocal current_books_raw_data_batch, nb_books_processed

        book_to_parse = queries.get_book_to_parse_data(pg_book_id, rdf_path)
        append_book = True
        if filter_func:
            book_satisfies_filter = filter_func(book_to_parse=book_to_parse)
            if not book_satisfies_filter:
                append_book = False
                _logger.logger.warning("%s:skipped_by_filter", str(pg_book_id).rjust(5))
        if append_book:
            current_books_raw_data_batch.append(book_to_parse)
        nb_books_processed += 1

        if len(current_books_raw_data_batch) == batch_size:
            _save_books_batch_to_db()

    def _save_books_batch_to_db():
        nonlocal current_books_raw_data_batch
        _store_raw_books_to_parse_batch_in_transitional_db(
            current_books_raw_data_batch, db_con
        )
        if on_book_batch_stored:
            on_book_batch_stored(len(current_books_raw_data_batch))
        current_books_raw_data_batch = []

    queries.crawl_rsynced_library(
        base_folder=base_folder, on_book_rdf=_on_book_rdf, limit=limit
    )

    if current_books_raw_data_batch:
        _save_books_batch_to_db()

    return nb_books_processed


def _store_raw_books_to_parse_batch_in_transitional_db(
    books_raw_data: t.List[domain.BookToParse], db_con: sqlite3.Connection
) -> None:
    books_data_for_sql = (
        _get_book_values_for_sql(book_raw_data) for book_raw_data in books_raw_data
    )

    db_con.executemany(_RAW_BOOKS_DB_SQL_INSERT, books_data_for_sql)
    db_con.commit()


def _get_book_values_for_sql(book_raw_data: domain.BookToParse) -> dict:
    return {
        "pg_book_id": book_raw_data.pg_book_id,
        "rdf_content": book_raw_data.rdf_content,
        "dir_files_sizes": json.dumps(book_raw_data.dir_files_sizes),
        "has_intro": int(book_raw_data.has_intro),
        "intro": book_raw_data.intro if book_raw_data.has_intro else None,
        "has_cover": int(book_raw_data.has_cover),
    }
