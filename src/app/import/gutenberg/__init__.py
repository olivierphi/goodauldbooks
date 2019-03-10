import logging
import re
import typing as t
from pathlib import Path
from string import Template

import xmltodict
from app.library.domain import Author, Book, BookAsset, BookAssetType

BOOK_INTRO_SIZE = 5000
RDF_FILE_REGEX = re.compile(r"^pg(\d+)\.rdf$")
PROVIDER_ID = "pg"

_AUTHOR_ID_FROM_PG_AGENT_REGEX = re.compile(r"/(\d+)$")
_ASSETS_TEMPLATES = {
    BookAssetType.EPUB: Template("pg${pg_book_id}.epub"),
    BookAssetType.MOBI: Template("pg${pg_book_id}.mobi"),
}


class BookToParse(t.NamedTuple):
    pg_book_id: int
    rdf_content: str
    dir_files_sizes: t.Dict[str, int]
    has_intro: bool
    has_cover: bool
    intro: str = None


logger = logging.getLogger("library_import")  # pylint: disable=invalid-name

OnBookRdf = t.Callable[[int, Path], t.Any]
OnBookParsed = t.Callable[[Book], t.Any]

# pylint: disable=no-value-for-parameter


def traverse_library(
    base_folder: Path, on_book_rdf: OnBookRdf, *, limit: int = None
) -> int:
    nb_pg_rdf_files_found = 0

    for rdf_file in base_folder.glob("*/*.rdf"):
        rdf_file_match = RDF_FILE_REGEX.fullmatch(rdf_file.name)
        if not rdf_file_match:
            continue

        nb_pg_rdf_files_found += 1

        pg_book_id = rdf_file_match[1]

        on_book_rdf(int(pg_book_id), rdf_file)

        if nb_pg_rdf_files_found == limit:
            logger.warning(f"Stopping library traversal because of limit '{limit}'")
            break

    return nb_pg_rdf_files_found


def get_book_to_parse_data(pg_book_id: int, rdf_path: Path) -> BookToParse:
    rdf_content = rdf_path.read_text()

    dir_files_sizes = {
        file.name: file.stat().st_size for file in rdf_path.parent.iterdir()
    }

    intro_file_path: Path = rdf_path.parent / f"pg{pg_book_id}.txt.utf8"
    has_intro = intro_file_path.exists()
    if has_intro:
        with intro_file_path.open() as intro_file:
            intro = intro_file.read(BOOK_INTRO_SIZE)
    else:
        intro = None

    cover_file_path: Path = rdf_path.parent / f"pg{pg_book_id}.cover.medium.jpg"
    has_cover = cover_file_path.exists()

    return BookToParse(
        pg_book_id=pg_book_id,
        rdf_content=rdf_content,
        dir_files_sizes=dir_files_sizes,
        has_intro=has_intro,
        intro=intro,
        has_cover=has_cover,
    )


def parse_book(book_to_parse: BookToParse) -> t.Optional[Book]:
    rdf_as_dict = xmltodict.parse(book_to_parse.rdf_content)

    book = _get_book(
        book_to_parse.pg_book_id,
        rdf_as_dict,
        book_to_parse.dir_files_sizes,
        book_to_parse.intro if book_to_parse.has_intro else None,
    )
    if book is None:
        return None

    # TODO: handle multiple authors
    author = _get_author(rdf_as_dict)
    if author:
        book.authors.append(author)

    return book


def _get_book(
    pg_book_id: int,
    rdf_as_dict: dict,
    book_files_sizes: t.Dict[str, int],
    intro: t.Optional[str],
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
    if not isinstance(lang, str):
        # TODO: Handle books with multiple langs?
        logger.warning("%s:unexpected_lang:%s", str(pg_book_id).rjust(5), lang)
        return None

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

    assets = _get_book_assets(pg_book_id, book_files_sizes)

    # Do we have a "[title]; [subtitle]" pattern in this book's title?
    title_list = title.split(";", maxsplit=1)
    if len(title_list) > 1:
        title = title_list[0].strip()
        subtitle = title_list[1].strip()
    else:
        subtitle = None

    return Book(
        provider=PROVIDER_ID,
        id=str(pg_book_id),
        title=title,
        subtitle=subtitle,
        lang=lang,
        genres=genres,
        assets=assets,
        authors=[],
        intro=intro,
    )


def _get_author(rdf_as_dict: dict) -> t.Optional[Author]:
    # Quick'n'dirty parsing :-)
    pg_agent_str = _get_value_from_dict(
        rdf_as_dict,
        ("rdf:RDF", "pgterms:ebook", "dcterms:creator", "pgterms:agent", "@rdf:about"),
    )
    if pg_agent_str is None:
        return None

    if not isinstance(pg_agent_str, str):
        # TODO: handle books with multiple authors (like pg10620) properly
        logger.warning("%s:unexpected_author_agent", pg_agent_str)
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
            last_name, first_name = [item.strip() for item in name_list]
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
        provider=PROVIDER_ID,
        id=str(pg_author_id),
        name=name,
        first_name=first_name,
        last_name=last_name,
        birth_year=birth_year,
        death_year=death_year,
    )


def _get_book_assets(
    pg_book_id: int, book_files_sizes: t.Dict[str, int]
) -> t.List[BookAsset]:
    assets = []
    for asset_type, tpl in _ASSETS_TEMPLATES.items():
        file_name = tpl.substitute({"pg_book_id": pg_book_id})
        if file_name in book_files_sizes:
            assets.append(BookAsset(type=asset_type, size=book_files_sizes[file_name]))
    return assets


def _get_value_from_dict(src: dict, path: t.Tuple[str, ...]) -> t.Optional[str]:
    if not path:
        return None
    current_path_item = path[0]
    if current_path_item not in src:
        return None
    if isinstance(src[current_path_item], dict):
        return _get_value_from_dict(src[current_path_item], path[1:])
    return src[current_path_item]
