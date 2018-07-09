import re
import time
import typing as t
from enum import Enum
from pathlib import Path

import click


@click.command()
@click.argument('path', type=click.Path(exists=True, dir_okay=True))
def hello(path: str):
    click.echo(f'Hello {path}!')
    start_time = time.time()
    nb_files = 0
    for rdf_file in Path(path).glob('**/*.rdf'):
        # dirname = os.path.dirname(rdf_file)
        rdf_processing_result = process_pg_rdf_file(rdf_file)
        nb_files += 1
        if nb_files % 100 == 0:
            print(rdf_file.resolve())
            print(rdf_processing_result)
            print(nb_files)
        if nb_files == 200:
            break
    print(nb_files)
    end_time = time.time()
    print(end_time - start_time)
    # for dirpath, dirs, files in os.walk(path):
    #     if os.fstat(f'{}')
    #     print(dirpath)


class BookAssetType(Enum):
    EPUB = 'EPUB'
    MOBI = 'MOBI'
    TXT = 'TXT'
    COVER = 'COVER'


BOOK_INTRO_LENGTH = 5000

BOOK_ASSETS_FILES_TYPES: t.Dict[BookAssetType, t.Pattern] = {
    BookAssetType.EPUB: re.compile('^pg\d+-images\.epub$'),
    BookAssetType.COVER: re.compile('^pg\d+\.cover\.medium\.jpg$'),
    BookAssetType.MOBI: re.compile('^pg\d+-images\.mobi$'),
    BookAssetType.TXT: re.compile('^pg\d+\.txt\.utf8$'),
}


class BookAsset(t.NamedTuple):
    size: int
    type: str
    path: str


class BookProcessingResult(t.NamedTuple):
    rdf_file_content: str
    assets: t.Dict[BookAssetType, BookAsset]
    intro: t.Optional[str]


def process_pg_rdf_file(rdf_file: Path) -> t.Optional[BookProcessingResult]:
    rdf_file_dir = rdf_file.parent
    assets = get_pg_book_assets(rdf_file_dir)

    if not BookAssetType.EPUB in assets:
        return None

    rdf_file_content = rdf_file.read_text(encoding='utf-8')

    book_intro: t.Optional[str] = None
    if BookAssetType.TXT in assets:
        with open(assets[BookAssetType.TXT].path, 'r', encoding="utf-8") as f:
            book_intro = f.read(BOOK_INTRO_LENGTH)

    result = BookProcessingResult(rdf_file_content=rdf_file_content, assets=assets, intro=book_intro)

    return result


def get_pg_book_assets(rdf_file_dir: Path) -> t.Dict[BookAssetType, BookAsset]:
    assets = {}
    for sibling in rdf_file_dir.iterdir():
        for asset_type, pattern in BOOK_ASSETS_FILES_TYPES.items():
            if pattern.fullmatch(sibling.name):
                book_asset = BookAsset(type=asset_type.name, size=sibling.stat().st_size, path=str(sibling.resolve()))
                assets[asset_type] = book_asset
    return assets


if __name__ == '__main__':
    hello()
