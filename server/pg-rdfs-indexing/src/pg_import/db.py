import os
import typing as t

import psycopg2  # type: ignore
import psycopg2.extras as psycopgextras  # type: ignore

from . import parsing

_BOOK_STORAGE_SQL = '''
    insert into import.gutenberg_raw_data(gutenberg_id, rdf_content, assets, intro)
      values (%(id)s, %(rdf_content)s, %(assets)s, %(intro)s);
'''


def add_book_storage_params_to_current_batch(books_to_store_cur_batch: t.List[t.Dict], books_root_path: str,
                                             book: parsing.BookProcessingResult) -> None:
    book_as_dict_for_db = _book_to_dict_for_db(books_root_path, book)
    books_to_store_cur_batch.append(book_as_dict_for_db)


def execute_books_storage_in_db_batch(books_to_store_cur_batch: t.List) -> None:
    if len(books_to_store_cur_batch) == 0:
        return

    db_conn = DbConnection.get_db()
    db_cursor = db_conn.cursor()

    psycopgextras.execute_batch(
        db_cursor,
        _BOOK_STORAGE_SQL,
        books_to_store_cur_batch
    )
    db_conn.commit()
    db_cursor.close()


def store_single_book_in_db(books_root_path: str, book: parsing.BookProcessingResult, commit: bool = True) -> None:
    db_conn = DbConnection.get_db()
    db_cursor = db_conn.cursor()

    book_as_dict_for_db = _book_to_dict_for_db(books_root_path, book)
    db_cursor.execute(_BOOK_STORAGE_SQL, book_as_dict_for_db)

    if commit:
        db_conn.commit()
        db_cursor.close()


def _book_to_dict_for_db(books_root_path: str, book: parsing.BookProcessingResult) -> t.Dict:
    return {
        'id': book.book_id,
        'rdf_content': book.rdf_file_content,
        'assets': book.assets_as_json(books_root_path),
        'intro': book.intro
    }


class DbConnection:
    __connection = None

    @staticmethod
    def get_db():
        # type: () -> psycopg2.connection
        if not DbConnection.__connection:
            # TODO: don't hard-code Docker-related stuff :-)
            DbConnection.__connection = psycopg2.connect(
                dbname=os.getenv('PGDATABASE'),
                host='db',
                port=5432,
                user=os.getenv('PGUSER'),
                password=os.getenv('PGPASSWORD'),
            )
        return DbConnection.__connection
