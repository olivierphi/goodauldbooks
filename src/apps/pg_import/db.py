import typing as t
from pathlib import Path

import psycopg2.extras as psycopgextras  # type: ignore
from django.db import connection

from . import parsing

_BOOK_STORAGE_SQL = """
    insert into gutenberg_raw_data(gutenberg_id, rdf_content, assets, intro, imported_at)
      values (%(id)s, %(rdf_content)s, %(assets)s, %(intro)s, now());
"""


def truncate_gutenberg_raw_data() -> None:
    SQL = "truncate gutenberg_raw_data;"
    with connection.cursor() as db_cursor:
        db_cursor.execute(SQL)


def add_book_storage_params_to_current_batch(
    books_to_store_cur_batch: t.List[dict],
    books_root_path: Path,
    book: parsing.BookProcessingResult,
) -> None:
    book_as_dict_for_db = _book_to_dict_for_db(books_root_path, book)
    books_to_store_cur_batch.append(book_as_dict_for_db)


def execute_books_storage_in_db_batch(books_to_store_cur_batch: t.List) -> None:
    if len(books_to_store_cur_batch) == 0:
        return

    with connection.cursor() as db_cursor:
        psycopgextras.execute_batch(
            db_cursor, _BOOK_STORAGE_SQL, books_to_store_cur_batch
        )


def store_single_book_in_db(
    books_root_path: Path, book: parsing.BookProcessingResult
) -> None:
    with connection.cursor() as db_cursor:
        book_as_dict_for_db = _book_to_dict_for_db(books_root_path, book)
        db_cursor.execute(_BOOK_STORAGE_SQL, book_as_dict_for_db)


def _book_to_dict_for_db(
    books_root_path: Path, book: parsing.BookProcessingResult
) -> dict:
    return {
        "id": book.book_id,
        "rdf_content": book.rdf_file_content,
        "assets": book.assets_as_json(books_root_path),
        "intro": book.intro,
    }
