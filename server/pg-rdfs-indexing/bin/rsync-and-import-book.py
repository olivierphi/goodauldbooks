#!/usr/bin/env python

from pathlib import Path
from subprocess import Popen, PIPE

import click

from pg_import import db as pg_db, parsing as pg_parsing

DEFAULT_PG_MIRROR = 'aleph.gutenberg.org::gutenberg-epub'


@click.command()
@click.argument('pg-book-id', type=click.INT)
@click.argument('books-path', type=click.Path(exists=True, dir_okay=True, file_okay=False, readable=True))
@click.option('--pg-mirror', default=DEFAULT_PG_MIRROR)
@click.option('--rsync-only', is_flag=True)
def rsync_and_process_pg_book(pg_book_id: int, books_path: str, pg_mirror: str, rsync_only: bool):
    click.secho('rsync-ing...', fg='blue')

    rsync_cmd = f'rsync -av --progress {pg_mirror}/{pg_book_id} {books_path}'
    click.echo(rsync_cmd)

    for rsync_output in run_and_stream_cmd(rsync_cmd):
        click.echo(f'{click.style("[rsync output]", fg="blue")} {rsync_output.decode("utf-8")}')

    click.secho('rsync done.', fg='blue')

    if rsync_only:
        return

    rdf_file: Path = Path(books_path) / str(pg_book_id) / f'pg{pg_book_id}.rdf'
    if not rdf_file.exists():
        click.secho(f'Could not find Project Gutenberg RDF file ${rdf_file} :-/', fg='red')
        return

    book_processing_result = pg_parsing.process_book_from_pg_rdf_file(str(pg_book_id), rdf_file)

    if not book_processing_result:
        click.secho('Unable to process this book :-/', fg='red')
        return

    pg_db.store_single_book_in_db(books_path, book_processing_result)
    click.secho('Book saved in DB.', fg='blue')


# @link https://zaiste.net/realtime_output_from_shell_command_in_python/
def run_and_stream_cmd(command: str):
    process = Popen(command, stdout=PIPE, shell=True)
    while True:
        line = process.stdout.readline().rstrip()
        if not line:
            break
        yield line


if __name__ == '__main__':
    rsync_and_process_pg_book()
