#!/usr/bin/env python

import re
import time
import typing as t
from datetime import timedelta
from pathlib import Path

import click

from pg_import import db as pg_db, parsing as pg_parsing

RDF_FILE_REGEX = re.compile('^pg(\d+)\.rdf$')
DB_BATCH_SIZE_DEFAULT = 150  # we will store books in DB only every N books

BOOK_TITLE_REGEX = re.compile(r'^.+<dcterms:title>(?P<title>[^<]+)</dcterms:title>.+$', re.DOTALL)


@click.command()
@click.argument('path', type=click.Path(exists=True, dir_okay=True, file_okay=False, readable=True))
@click.option('--batch-size', default=DB_BATCH_SIZE_DEFAULT, type=click.INT)
def find_and_process_pg_books(path: str, batch_size: int):
    start_time = time.time()
    nb_rdf_files_found = 0
    nb_books_processed = 0
    books_to_store_cur_batch: t.List[t.Dict] = []
    handled_pg_books_ids: t.List[str] = []
    for rdf_file in Path(path).glob('*/*.rdf'):

        nb_rdf_files_found += 1
        rdf_file_match = RDF_FILE_REGEX.fullmatch(rdf_file.name)
        if not rdf_file_match:
            continue

        pg_book_id = rdf_file_match[1]

        if pg_book_id in handled_pg_books_ids:
            click.echo(f'PG book "{pg_book_id}" already handled (file "{rdf_file}"). Skipping...')
            continue

        book_processing_result = pg_parsing.process_book_from_pg_rdf_file(pg_book_id, rdf_file)

        if not book_processing_result:
            continue

        pg_db.add_book_storage_params_to_current_batch(books_to_store_cur_batch, path, book_processing_result)

        handled_pg_books_ids.append(pg_book_id)

        nb_books_processed += 1

        if nb_books_processed % batch_size == 0:
            pg_db.execute_books_storage_in_db_batch(books_to_store_cur_batch)
            books_to_store_cur_batch = []

        if nb_books_processed % 100 == 0:
            quick_n_dirty_title_lookup = BOOK_TITLE_REGEX.match(book_processing_result.rdf_file_content)
            book_title = quick_n_dirty_title_lookup['title'].replace('\n', ' ') if quick_n_dirty_title_lookup else '?'
            click.echo(
                f'{str(nb_books_processed).rjust(5)} books processed- pg{book_processing_result.book_id} - {book_title}')

    pg_db.execute_books_storage_in_db_batch(books_to_store_cur_batch)

    click.echo(f'{nb_rdf_files_found} RDF files found, {nb_books_processed} saved into database.')
    end_time = time.time()
    click.echo(f'Duration: {timedelta(seconds=round(end_time - start_time))}')


if __name__ == '__main__':
    find_and_process_pg_books()
