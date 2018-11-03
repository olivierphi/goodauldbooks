import json
import logging
import re
import sqlite3
import typing as t
from pathlib import Path
from string import Template

import xmltodict
from .domain import Author, Book, BookAsset, BookAssetType

BOOK_INTRO_SIZE = 5000
RDF_FILE_REGEX = re.compile(r"^pg(\d+)\.rdf$")
RAW_BOOKS_STORAGE_IN_DB_BATCH_SIZE = 100
LIBRARY_TRAVERSAL_LIMIT = 0

logger = logging.getLogger(__name__)

_RAW_BOOKS_DB_SQL_TABLE_CREATION = """\
create table raw_book(
    pg_book_id int not null, 
    rdf_content text not null,
    dir_content text not null,
    has_intro int(1) not null, 
    intro text,
    has_cover int(1) not null
);
"""
_RAW_BOOKS_DB_SQL_INSERT = """\
insert into raw_book
    (pg_book_id, rdf_content, dir_content, has_intro, intro, has_cover)
values
    (:pg_book_id, :rdf_content, :dir_content, :has_intro, :intro, :has_cover);
"""

_AUTHOR_ID_FROM_PG_AGENT_REGEX = re.compile(r"/(\d+)$")
_ASSETS_TEMPLATES = {
    BookAssetType.EPUB: Template("pg${pg_book_id}.epub"),
    BookAssetType.MOBI: Template("pg${pg_book_id}.mobi"),
}

OnBookBatchStored = t.Callable[[int, Path], t.Any]
OnBookRdf = t.Callable[[int, Path], t.Any]
OnBookParsed = t.Callable[[Book, t.Optional[Author]], t.Any]


def traverse_library_and_store_raw_data_in_db(
    base_folder: Path,
    db_con: sqlite3.Connection,
    filter: t.Callable[[dict], bool] = None,
    on_book_batch_stored: OnBookBatchStored = None,
) -> int:
    nb_books_processed = 0

    current_books_raw_data_batch: t.List[dict] = []

    def _on_book_rdf(pg_book_id: int, rdf_path: Path):
        nonlocal current_books_raw_data_batch, nb_books_processed

        book_raw_data = get_book_raw_data(pg_book_id, rdf_path)
        append_book = True
        if filter:
            book_satisfies_filter = filter(book_raw_data)
            if not book_satisfies_filter:
                append_book = False
                logger.warning("%s:skipped_by_filter", str(pg_book_id).rjust(5))
        if append_book:
            current_books_raw_data_batch.append(book_raw_data)
        nb_books_processed += 1

        if len(current_books_raw_data_batch) == RAW_BOOKS_STORAGE_IN_DB_BATCH_SIZE:
            _store_books_batch()

    def _store_books_batch():
        nonlocal current_books_raw_data_batch
        _store_raw_books_data_batch_in_db(current_books_raw_data_batch, db_con)
        if on_book_batch_stored:
            on_book_batch_stored(len(current_books_raw_data_batch))
        current_books_raw_data_batch = []

    traverse_library(base_folder, _on_book_rdf)

    if current_books_raw_data_batch:
        _store_books_batch()

    return nb_books_processed


def traverse_library(base_folder: Path, on_book_rdf: OnBookRdf) -> int:
    nb_pg_rdf_files_found = 0

    for rdf_file in base_folder.glob("*/*.rdf"):
        rdf_file_match = RDF_FILE_REGEX.fullmatch(rdf_file.name)
        if not rdf_file_match:
            continue

        nb_pg_rdf_files_found += 1

        pg_book_id = rdf_file_match[1]

        on_book_rdf(int(pg_book_id), rdf_file)

        if nb_pg_rdf_files_found == LIBRARY_TRAVERSAL_LIMIT:
            break

    return nb_pg_rdf_files_found


def parse_books_from_raw_db(
    db_con: sqlite3.Connection, on_book_parsed: OnBookParsed
) -> int:
    nb_books_parsed = 0

    db_con.row_factory = sqlite3.Row

    SQL = """\
        select pg_book_id, rdf_content, dir_content, has_intro, intro, has_cover from raw_book order by pg_book_id;
    """
    for raw_book_row in db_con.execute(SQL):
        dir_content = json.loads(raw_book_row["dir_content"])
        book_parsing_res = _parse_book(
            raw_book_row["pg_book_id"], raw_book_row["rdf_content"], dir_content
        )
        if book_parsing_res is None:
            continue
        book, author = book_parsing_res
        on_book_parsed(book, author)

        nb_books_parsed += 1

    return nb_books_parsed


def init_raw_books_db(db_con: sqlite3.Connection) -> None:
    db_con.execute(_RAW_BOOKS_DB_SQL_TABLE_CREATION)


def _store_raw_books_data_batch_in_db(
    books_raw_data: t.List[dict], db_con: sqlite3.Connection
) -> None:
    def _get_book_values_for_sql(book_raw_data: dict) -> dict:
        return {
            "pg_book_id": book_raw_data["pg_book_id"],
            "rdf_content": book_raw_data["rdf_content"],
            "dir_content": json.dumps(book_raw_data["dir_content"]),
            "has_intro": int(book_raw_data["has_intro"]),
            "intro": book_raw_data["intro"] if book_raw_data["has_intro"] else None,
            "has_cover": int(book_raw_data["has_cover"]),
        }

    books_data_for_sql = (
        _get_book_values_for_sql(book_raw_data) for book_raw_data in books_raw_data
    )

    db_con.executemany(_RAW_BOOKS_DB_SQL_INSERT, books_data_for_sql)
    db_con.commit()


def get_book_raw_data(pg_book_id: int, rdf_path: Path) -> dict:
    book_raw_data = {"pg_book_id": pg_book_id}

    book_raw_data["rdf_content"] = rdf_path.read_text()

    book_raw_data["dir_content"] = [
        {"name": file.name, "size": file.stat().st_size}
        for file in rdf_path.parent.iterdir()
    ]

    intro_file_path: Path = rdf_path.parent / f"pg{pg_book_id}.txt.utf8"
    book_raw_data["has_intro"] = intro_file_path.exists()
    if book_raw_data["has_intro"]:
        with intro_file_path.open() as intro_file:
            book_raw_data["intro"] = intro_file.read(BOOK_INTRO_SIZE)

    cover_file_path: Path = rdf_path.parent / f"pg{pg_book_id}.cover.medium.jpg"
    book_raw_data["has_cover"] = cover_file_path.exists()

    return book_raw_data


def _parse_book(
    pg_book_id: int, rdf_content: str, book_files: t.List[t.Dict[str, t.Any]]
) -> t.Optional[t.Tuple[Book, t.Optional[Author]]]:
    rdf_as_dict = xmltodict.parse(rdf_content)

    book = _get_book(pg_book_id, rdf_as_dict, book_files)
    if book is None:
        return None

    author = _get_author(rdf_as_dict)
    return (book, author)


def _get_book(
    pg_book_id: int, rdf_as_dict: dict, book_files: t.List[t.Dict[str, t.Any]]
) -> t.Optional[Book]:
    # Quick'n'dirty parsing :-)
    title = _get_value_from_dict(
        rdf_as_dict, ("rdf:RDF", "pgterms:ebook", "dcterms:title")
    )
    if not isinstance(title, str):
        logger.warning("%s:unexpected_title:%s", str(pg_book_id).rjust(5), title)
        return None

    lang = _get_value_from_dict(
        rdf_as_dict,
        (
            "rdf:RDF",
            "pgterms:ebook",
            "dcterms:language",
            "rdf:Description",
            "rdf:value",
            "#text",
        ),
    )
    genres_container = _get_value_from_dict(
        rdf_as_dict, ("rdf:RDF", "pgterms:ebook", "dcterms:subject")
    )
    if genres_container:
        genres = [g["rdf:Description"]["rdf:value"] for g in genres_container]
        for genre in genres:
            if not isinstance(genre, str):
                logger.warning(
                    "%s:unexpected_genre:%s", str(pg_book_id).rjust(5), genre
                )
                return None
    else:
        genres = []

    assets = _get_book_assets(pg_book_id, book_files)

    return Book(
        gutenberg_id=pg_book_id, title=title, lang=lang, genres=genres, assets=assets
    )


def _get_author(rdf_as_dict: dict) -> t.Optional[Author]:
    # Quick'n'dirty parsing :-)
    pg_agent_str = _get_value_from_dict(
        rdf_as_dict,
        ("rdf:RDF", "pgterms:ebook", "dcterms:creator", "pgterms:agent", "@rdf:about"),
    )
    if pg_agent_str is None:
        return None

    if isinstance(pg_agent_str, list):
        # TODO: handle books with multiple authors (like pg10620) properly
        return None

    pg_author_id = int(_AUTHOR_ID_FROM_PG_AGENT_REGEX.search(pg_agent_str).group(1))

    name = _get_value_from_dict(
        rdf_as_dict,
        (
            "rdf:RDF",
            "pgterms:ebook",
            "dcterms:creator",
            "pgterms:agent",
            "pgterms:name",
        ),
    )
    last_name, first_name = None, None
    if name:
        name_list = name.split(",")
        if len(name_list) == 2:
            first_name, last_name = [item.strip() for item in name_list]
    birth_year = _get_value_from_dict(
        rdf_as_dict,
        (
            "rdf:RDF",
            "pgterms:ebook",
            "dcterms:creator",
            "pgterms:agent",
            "pgterms:birthdate",
            "#text",
        ),
    )
    if birth_year:
        birth_year = int(birth_year)
    death_year = _get_value_from_dict(
        rdf_as_dict,
        (
            "rdf:RDF",
            "pgterms:ebook",
            "dcterms:creator",
            "pgterms:agent",
            "pgterms:deathdate",
            "#text",
        ),
    )
    if death_year:
        death_year = int(death_year)

    return Author(
        gutenberg_id=pg_author_id,
        name=name,
        first_name=first_name,
        last_name=last_name,
        birth_year=birth_year,
        death_year=death_year,
    )


def _get_book_assets(
    pg_book_id: int, book_files: t.List[t.Dict[str, t.Any]]
) -> t.List[BookAsset]:
    assets = []
    for asset_type, tpl in _ASSETS_TEMPLATES.items():
        file_name = tpl.substitute({"pg_book_id": pg_book_id})
        for file_data in book_files:
            if file_name == file_data["name"]:
                assets.append(BookAsset(type=asset_type, size=file_data["size"]))
    return assets


def _get_value_from_dict(src: dict, path: t.Tuple[str, ...]) -> t.Optional[str]:
    if not path:
        return None
    current_path_item = path[0]
    if current_path_item not in src:
        return None
    elif isinstance(src[current_path_item], dict):
        return _get_value_from_dict(src[current_path_item], path[1:])
    else:
        return src[current_path_item]
