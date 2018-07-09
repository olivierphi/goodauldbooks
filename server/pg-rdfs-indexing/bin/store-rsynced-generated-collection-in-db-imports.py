import json
import os
import re
import time
import typing as t
from enum import Enum
from pathlib import Path

import click
import psycopg2  # type: ignore
import psycopg2.extras as psycopgextras  # type: ignore


class BookAssetType(Enum):
    EPUB = 'epub'
    MOBI = 'mobi'
    TXT = 'txt'
    COVER = 'cover'


RDF_FILE_REGEX = re.compile('^pg(\d+)\.rdf$')
BOOK_INTRO_LENGTH = 5000
DB_BATCH_SIZE_DEFAULT = 150  # we will store books in DB only every N books

BOOK_ASSETS_FILES_TYPES: t.Dict[BookAssetType, t.Pattern] = {
    BookAssetType.EPUB: re.compile('^pg\d+-images\.epub$'),
    BookAssetType.COVER: re.compile('^pg\d+\.cover\.medium\.jpg$'),
    BookAssetType.MOBI: re.compile('^pg\d+-images\.mobi$'),
    BookAssetType.TXT: re.compile('^pg\d+\.txt\.utf8$'),
}


class BookAsset(t.NamedTuple):
    size: int
    type: BookAssetType
    path: Path


class BookProcessingResult(t.NamedTuple):
    book_id: str
    rdf_file_content: str
    assets: t.Dict[BookAssetType, BookAsset]
    intro: t.Optional[str]

    def assets_as_json(self, books_root_path: str) -> str:
        assets_as_simple_structures = {
            type.value: {'path': str(data.path.relative_to(books_root_path)), 'size': data.size}
            for (type, data) in self.assets.items()
        }
        return json.dumps(assets_as_simple_structures)


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

        book_processing_result = process_book_from_pg_rdf_file(pg_book_id, rdf_file)

        if not book_processing_result:
            continue

        add_book_storage_params_to_current_batch(books_to_store_cur_batch, path, book_processing_result)

        handled_pg_books_ids.append(pg_book_id)

        nb_books_processed += 1

        if nb_books_processed % batch_size == 0:
            execute_books_storage_in_db_batch(books_to_store_cur_batch)
            books_to_store_cur_batch = []

        if nb_books_processed % 100 == 0:
            click.echo(str(nb_books_processed))

    execute_books_storage_in_db_batch(books_to_store_cur_batch)

    click.echo(f'{nb_rdf_files_found} RDF files found, {nb_books_processed} saved into database.')
    end_time = time.time()
    click.echo(f'Took {end_time - start_time}s.')


def process_book_from_pg_rdf_file(pg_book_id: str, rdf_file: Path) -> t.Optional[BookProcessingResult]:
    rdf_file_dir = rdf_file.parent
    assets = get_pg_book_assets(rdf_file_dir)

    if BookAssetType.EPUB not in assets:
        return None

    rdf_file_content = rdf_file.read_text(encoding='utf-8')

    book_intro: t.Optional[str] = None
    if BookAssetType.TXT in assets:
        with open(assets[BookAssetType.TXT].path, 'r', encoding='utf-8') as f:
            book_intro = f.read(BOOK_INTRO_LENGTH)

    result = BookProcessingResult(
        book_id=pg_book_id, rdf_file_content=rdf_file_content,
        assets=assets, intro=book_intro
    )

    return result


def get_pg_book_assets(rdf_file_dir: Path) -> t.Dict[BookAssetType, BookAsset]:
    assets = {}
    for sibling in rdf_file_dir.iterdir():
        for asset_type, pattern in BOOK_ASSETS_FILES_TYPES.items():
            if pattern.fullmatch(sibling.name):
                book_asset = BookAsset(type=asset_type, size=sibling.stat().st_size, path=sibling.resolve())
                assets[asset_type] = book_asset
    return assets


def add_book_storage_params_to_current_batch(books_to_store_cur_batch: t.List[t.Dict], books_root_path: str,
                                             book: BookProcessingResult) -> None:
    books_to_store_cur_batch.append({
        'id': book.book_id,
        'rdf_content': book.rdf_file_content,
        'assets': book.assets_as_json(books_root_path),
        'intro': book.intro
    })


def execute_books_storage_in_db_batch(books_to_store_cur_batch: t.List) -> None:
    if len(books_to_store_cur_batch) == 0:
        return

    db_conn, db_cursor = DbConnection.get_db()
    psycopgextras.execute_batch(
        db_cursor,
        '''
        insert into import.gutenberg_raw_data(gutenberg_id, rdf_content, assets, intro)
          values (%(id)s, %(rdf_content)s, %(assets)s, %(intro)s);
        ''',
        books_to_store_cur_batch
    )
    db_conn.commit()


class DbConnection:
    __connection = None
    __cursor = None

    @staticmethod
    def get_db():
        # type: () -> t.Tuple[psycopg2.connection, psycopg2.cursor]
        if not DbConnection.__connection:
            # TODO: don't hard-code Docker-related stuff :-)
            DbConnection.__connection = psycopg2.connect(
                dbname=os.getenv('PGDATABASE'),
                host='db',
                port=5432,
                user=os.getenv('PGUSER'),
                password=os.getenv('PGPASSWORD'),
            )
            DbConnection.__cursor = DbConnection.__connection.cursor()
        return DbConnection.__connection, DbConnection.__cursor


if __name__ == '__main__':
    find_and_process_pg_books()
