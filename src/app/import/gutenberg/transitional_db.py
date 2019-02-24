import json
import sqlite3
import typing as t
from pathlib import Path

from . import (
    OnBookParsed,
    parse_book,
    BookToParse,
    logger,
    get_book_to_parse_data,
    traverse_library,
)

RAW_BOOKS_STORAGE_IN_DB_BATCH_SIZE = 100
PARSE_BOOK_FROM_DB_LIMIT = 0

# We could have used Django ORM to handle that SQLite database, but it's quite low-level
# and only used as a transition between the Project Gutenberg books file tree and our Postgres database
# so let's keep it simple and stupid (and low-level).
_RAW_BOOKS_DB_SQL_TABLE_CREATION = """\
create table raw_book(
    pg_book_id int not null, 
    rdf_content text not null,
    dir_files_sizes text not null,
    has_intro int(1) not null, 
    intro text,
    has_cover int(1) not null
);
"""
_RAW_BOOKS_DB_SQL_INSERT = """\
insert into raw_book
    (pg_book_id, rdf_content, dir_files_sizes, has_intro, intro, has_cover)
values
    (:pg_book_id, :rdf_content, :dir_files_sizes, :has_intro, :intro, :has_cover);
"""

OnBookBatchStored = t.Callable[[int, Path], t.Any]


def traverse_library_and_store_raw_data_in_db(
    base_folder: Path,
    db_con: sqlite3.Connection,
    filter_func: t.Callable[[dict], bool] = None,
    on_book_batch_stored: OnBookBatchStored = None,
) -> int:
    nb_books_processed = 0

    current_books_raw_data_batch: t.List[dict] = []

    def _on_book_rdf(pg_book_id: int, rdf_path: Path):
        nonlocal current_books_raw_data_batch, nb_books_processed

        book_to_parse = get_book_to_parse_data(pg_book_id, rdf_path)
        append_book = True
        if filter_func:
            book_satisfies_filter = filter_func(book_to_parse)
            if not book_satisfies_filter:
                append_book = False
                logger.warning("%s:skipped_by_filter", str(pg_book_id).rjust(5))
        if append_book:
            current_books_raw_data_batch.append(book_to_parse)
        nb_books_processed += 1

        if len(current_books_raw_data_batch) == RAW_BOOKS_STORAGE_IN_DB_BATCH_SIZE:
            _save_books_batch_to_db()

    def _save_books_batch_to_db():
        nonlocal current_books_raw_data_batch
        store_raw_books_to_parse_batch_in_transitional_db(
            current_books_raw_data_batch, db_con
        )
        if on_book_batch_stored:
            on_book_batch_stored(len(current_books_raw_data_batch))
        current_books_raw_data_batch = []

    traverse_library(base_folder, _on_book_rdf)

    if current_books_raw_data_batch:
        _save_books_batch_to_db()

    return nb_books_processed


def parse_books_from_transitional_db(
    db_con: sqlite3.Connection, on_book_parsed: OnBookParsed
) -> int:
    nb_books_parsed = 0

    db_con.row_factory = sqlite3.Row

    # pylint: disable=invalid-name
    SQL = """
        select 
            pg_book_id, rdf_content, dir_files_sizes, has_intro, intro, has_cover
        from 
            raw_book
        order by
         pg_book_id;
    """
    for raw_book_row in db_con.execute(SQL):
        # pylint: disable=no-value-for-parameter
        book_to_parse = BookToParse(
            pg_book_id=raw_book_row["pg_book_id"],
            rdf_content=raw_book_row["rdf_content"],
            dir_files_sizes=json.loads(raw_book_row["dir_files_sizes"]),
            has_intro=bool(raw_book_row["has_intro"]),
            intro=raw_book_row["intro"] if raw_book_row["has_intro"] else None,
            has_cover=bool(raw_book_row["has_cover"]),
        )
        book = parse_book(book_to_parse)
        if book is None:
            continue
        on_book_parsed(book)

        nb_books_parsed += 1

        if nb_books_parsed == PARSE_BOOK_FROM_DB_LIMIT:
            break

    return nb_books_parsed


def init_books_transitional_db(db_con: sqlite3.Connection) -> None:
    db_con.execute(_RAW_BOOKS_DB_SQL_TABLE_CREATION)


def store_raw_books_to_parse_batch_in_transitional_db(
    books_raw_data: t.List[BookToParse], db_con: sqlite3.Connection
) -> None:
    books_data_for_sql = (
        _get_book_values_for_sql(book_raw_data) for book_raw_data in books_raw_data
    )

    db_con.executemany(_RAW_BOOKS_DB_SQL_INSERT, books_data_for_sql)
    db_con.commit()


def _get_book_values_for_sql(book_raw_data: BookToParse) -> dict:
    return {
        "pg_book_id": book_raw_data.pg_book_id,
        "rdf_content": book_raw_data.rdf_content,
        "dir_files_sizes": json.dumps(book_raw_data.dir_files_sizes),
        "has_intro": int(book_raw_data.has_intro),
        "intro": book_raw_data.intro if book_raw_data.has_intro else None,
        "has_cover": int(book_raw_data.has_cover),
    }
