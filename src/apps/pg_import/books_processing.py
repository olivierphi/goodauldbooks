import re
import time
import typing as t
from datetime import timedelta
from pathlib import Path

from . import db, parsing

RDF_FILE_REGEX = re.compile("^pg(\d+)\.rdf$")
DB_BATCH_SIZE_DEFAULT = 150
DB_LOG_PERIOD_DEFAULT = 150

BOOK_TITLE_REGEX = re.compile(
    r"^.+<dcterms:title>(?P<title>[^<]+)</dcterms:title>.+$", re.DOTALL
)


def find_and_process_pg_books(
    directory: Path,
    batch_size: int = DB_BATCH_SIZE_DEFAULT,  # we will store books in DB only every N books
    log_period: int = DB_LOG_PERIOD_DEFAULT,  # we will log the current book title only every N books
    log: t.Optional[t.Callable] = None,
) -> int:
    if log is None:
        log = lambda _: _
    start_time = time.time()
    nb_rdf_files_found = 0
    nb_books_processed = 0
    books_to_store_cur_batch: t.List[t.Dict] = []
    handled_pg_books_ids: t.List[str] = []
    log(f"Starting PG books processing...")
    for rdf_file in directory.glob("*/*.rdf"):

        nb_rdf_files_found += 1
        rdf_file_match = RDF_FILE_REGEX.fullmatch(rdf_file.name)
        if not rdf_file_match:
            continue

        pg_book_id = rdf_file_match[1]

        if pg_book_id in handled_pg_books_ids:
            log(
                f'PG book "{pg_book_id}" already handled (file "{rdf_file}"). Skipping...'
            )
            continue

        book_processing_result = parsing.process_book_from_pg_rdf_file(
            pg_book_id, rdf_file
        )

        if not book_processing_result:
            continue

        db.add_book_storage_params_to_current_batch(
            books_to_store_cur_batch, directory, book_processing_result
        )

        handled_pg_books_ids.append(pg_book_id)

        nb_books_processed += 1

        if nb_books_processed % batch_size == 0:
            log(
                f"Sending batch of {len(books_to_store_cur_batch)} books to Postgres..."
            )
            db.execute_books_storage_in_db_batch(books_to_store_cur_batch)
            log(f"Batch sent.")
            books_to_store_cur_batch = []

        if nb_books_processed % log_period == 0:
            quick_n_dirty_title_lookup = BOOK_TITLE_REGEX.match(
                book_processing_result.rdf_file_content
            )
            book_title = (
                quick_n_dirty_title_lookup["title"].replace("\n", " ")
                if quick_n_dirty_title_lookup
                else "?"
            )
            log(
                f"{str(nb_books_processed).rjust(5)} books processed - pg{book_processing_result.book_id.ljust(5)} - {book_title}"
            )

    db.execute_books_storage_in_db_batch(books_to_store_cur_batch)

    log(
        f"{nb_rdf_files_found} RDF files found, {nb_books_processed} saved into database."
    )
    end_time = time.time()
    log(
        f"Python PG books processing finished. Duration: {timedelta(seconds=round(end_time - start_time))}"
    )

    return nb_books_processed
