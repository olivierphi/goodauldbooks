import logging
import re
import typing as t
from pathlib import Path
from string import Template
import xml.etree.ElementTree as ET

from app.library.domain import Author, Book, BookAsset, BookAssetType

BOOK_INTRO_SIZE = 5000
RDF_FILE_REGEX = re.compile(r"^pg(\d+)\.rdf$")
PROVIDER_ID = "pg"
_GUTENBERG_XML_NAMESPACES = {
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "dcterms": "http://purl.org/dc/terms/",
    "pgterms": "http://www.gutenberg.org/2009/pgterms/",
}

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
    rdf_data = ET.fromstring(book_to_parse.rdf_content)

    book = _get_book(
        book_to_parse.pg_book_id,
        rdf_data,
        book_to_parse.dir_files_sizes,
        book_to_parse.intro if book_to_parse.has_intro else None,
    )

    return book


def _get_book(
    pg_book_id: int,
    rdf_data: ET.Element,
    book_files_sizes: t.Dict[str, int],
    intro: t.Optional[str],
) -> t.Optional[Book]:
    title = rdf_data.findtext(".//dcterms:title", None, _GUTENBERG_XML_NAMESPACES)
    if not title:
        return None

    lang = rdf_data.findtext(
        ".//dcterms:language/rdf:Description/rdf:value", None, _GUTENBERG_XML_NAMESPACES
    )
    genres = [
        el.text
        for el in rdf_data.findall(
            ".//dcterms:subject/rdf:Description/rdf:value", _GUTENBERG_XML_NAMESPACES
        )
    ]

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
        assets=_get_book_assets(pg_book_id, book_files_sizes),
        authors=_get_authors(rdf_data),
        intro=intro,
    )


def _get_authors(rdf_data: ET.Element) -> t.List[Author]:
    authors = []

    authors_data = rdf_data.findall(".//pgterms:agent", _GUTENBERG_XML_NAMESPACES)
    for author_data in authors_data:
        # Author Id
        pg_agent_str = author_data.attrib[
            f"{{{_GUTENBERG_XML_NAMESPACES['rdf']}}}about"
        ]
        pg_author_id = int(_AUTHOR_ID_FROM_PG_AGENT_REGEX.search(pg_agent_str).group(1))
        # Name, first name, last name
        name = author_data.findtext("./pgterms:name", None, _GUTENBERG_XML_NAMESPACES)
        last_name, first_name = None, None
        if name:
            name_list = name.split(",")
            if len(name_list) == 2:
                last_name, first_name = [item.strip() for item in name_list]
        # Birth and death dates
        birth_year = author_data.findtext(
            "./pgterms:birthdate", None, _GUTENBERG_XML_NAMESPACES
        )
        death_year = author_data.findtext(
            "./pgterms:deathdate", None, _GUTENBERG_XML_NAMESPACES
        )

        author = Author(
            provider=PROVIDER_ID,
            id=str(pg_author_id),
            name=name,
            first_name=first_name,
            last_name=last_name,
            birth_year=birth_year,
            death_year=death_year,
        )
        authors.append(author)

    return authors


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
