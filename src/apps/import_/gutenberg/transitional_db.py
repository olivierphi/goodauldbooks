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


def parse_books_from_transitional_db(
    db_con: sqlite3.Connection, on_book_parsed: OnBookParsed, *, limit: int = None
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
         pg_book_id
    """
    if limit:
        SQL = f"{SQL} limit {limit}"

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
