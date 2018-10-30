import re
import typing as t
from pathlib import Path

import xmltodict
from .domain import Author, Book

RDF_FILE_REGEX = re.compile(r"^pg(\d+)\.rdf$")
AUTHOR_ID_FROM_PG_AGENT_REGEX = re.compile(r"/(\d+)$")

OnBookParsed = t.Callable[[Book, t.Optional[Author]], t.Any]


def traverse_library(base_folder: Path, on_book_parsed: OnBookParsed = None) -> int:
    nb_pg_rdf_files_found = 0

    for rdf_file in base_folder.glob("*/*.rdf"):
        rdf_file_match = RDF_FILE_REGEX.fullmatch(rdf_file.name)
        if not rdf_file_match:
            continue

        nb_pg_rdf_files_found += 1
        pg_book_id = rdf_file_match[1]

        _handle_book(int(pg_book_id), rdf_file, on_book_parsed)

        print(".", end="", flush=True)
        if False and nb_pg_rdf_files_found > 1000:
            break
        if nb_pg_rdf_files_found % 80 == 0:
            print("")

    return nb_pg_rdf_files_found


def _handle_book(pg_book_id: int, rdf_path: Path, on_book_parsed: OnBookParsed = None):
    with rdf_path.open() as rdf_file:
        rdf_content = rdf_file.read()
        book, author = _parse_book(pg_book_id, rdf_content)
        if on_book_parsed:
            on_book_parsed(book, author)


def _parse_book(pg_book_id: int, rdf_content: str) -> t.Tuple[Book, t.Optional[Author]]:
    rdf_as_dict = xmltodict.parse(rdf_content)

    book = _get_book(pg_book_id, rdf_as_dict)
    author = _get_author(rdf_as_dict)
    return (book, author)


def _get_book(pg_book_id: int, rdf_as_dict: dict) -> Book:
    # Quick'n'dirty parsing :-)
    title = _get_value_from_dict(
        rdf_as_dict, ("rdf:RDF", "pgterms:ebook", "dcterms:title")
    )

    return Book(gutenberg_id=pg_book_id, title=title)


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

    pg_author_id = int(AUTHOR_ID_FROM_PG_AGENT_REGEX.search(pg_agent_str).group(1))

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
