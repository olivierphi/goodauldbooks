import sqlite3
import time
from pathlib import Path
import typing as t

import click

from .. import domain, _logger, mutations, queries


@click.argument("pg_collection_path", type=click.Path(exists=True, file_okay=False))
@click.argument("sqlite_db_path", type=click.Path(dir_okay=False))
@click.option("--limit", type=click.INT)
@click.option("--batch-size", type=click.INT)
def store_rsynced_library_in_transitional_db(
    *,
    pg_collection_path: str,
    sqlite_db_path: str,
    limit: t.Optional[int],
    batch_size: t.Optional[int],
):
    _store_raw_gutenberg_library_in_transitional_db(
        pg_collection_path=Path(pg_collection_path),
        sqlite_db_path=Path(sqlite_db_path),
        limit=limit,
        batch_size=batch_size,
    )


def _store_raw_gutenberg_library_in_transitional_db(
    *,
    pg_collection_path: Path,
    sqlite_db_path: Path,
    limit: t.Optional[int] = None,
    batch_size: t.Optional[int],
) -> int:
    start_time = time.monotonic()

    if sqlite_db_path.exists():
        sqlite_db_path.unlink()
    db_con = sqlite3.connect(str(sqlite_db_path))

    db_con.execute(domain.RAW_BOOKS_DB_SQL_TABLE_CREATION)
    db_con.commit()

    nb_books_stored = 0

    def on_book_batch_stored(nb_books_in_batch: int) -> None:
        nonlocal nb_books_stored
        nb_books_stored += nb_books_in_batch
        duration = round(time.monotonic() - start_time, 1)
        _logger.logger.info(
            f"{nb_books_stored} books stored. In progress... ({duration}s)"
        )

    filter_func: domain.BookToParseFilterFunc = queries.should_store_rsynced_book

    mutations.crawl_rsynced_library_and_store_raw_data_in_sqlite(
        base_folder=pg_collection_path,
        db_con=db_con,
        filter_func=filter_func,
        on_book_batch_stored=on_book_batch_stored,
        limit=limit,
        batch_size=batch_size,
    )

    return db_con.execute("select count(*) from raw_book").fetchone()[0]
