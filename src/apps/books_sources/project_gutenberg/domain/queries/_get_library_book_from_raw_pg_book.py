import re
import xml.etree.ElementTree as ET
from pathlib import PurePath
from typing import NamedTuple, cast

from django.utils.text import slugify

from apps.books_sources.project_gutenberg.domain.constants import (
    BOOK_ASSET_SUFFIXES,
    GUTENBERG_XML_NAMESPACES,
    SOURCE_ID,
)
from apps.library.domain.types import BookAsset, BookAssetType
from apps.library.models import Author, Book, BookAdditionalData, Genre

from ... import logger
from ..types import BookToParse

_AUTHOR_ID_FROM_PG_AGENT_REGEX = re.compile(r"/(\d+)$")


class LibraryBookData(NamedTuple):
    book: Book
    authors: list[Author]
    genres: list[Genre]


def get_library_book_from_raw_pg_book(*, raw_book: BookToParse) -> LibraryBookData | None:
    rdf_data = ET.fromstring(raw_book["rdf_content"])

    return _get_book_library_data(rdf_data, raw_book)


def _get_book_library_data(rdf_data: ET.Element, raw_book: BookToParse) -> LibraryBookData | None:
    title = rdf_data.findtext(".//dcterms:title", None, GUTENBERG_XML_NAMESPACES)
    if not title:
        return None

    lang = rdf_data.findtext(".//dcterms:language/rdf:Description/rdf:value", None, GUTENBERG_XML_NAMESPACES)

    # Do we have a "[title]; [subtitle]" pattern in this book's title?
    title_list = title.split(";", maxsplit=1)
    if len(title_list) > 1:
        title = title_list[0].strip()
        subtitle = title_list[1].strip()
    else:
        subtitle = None

    pg_book_id = raw_book["pg_book_id"]

    book_assets = _get_book_assets(raw_book)

    try:
        size = [asset.size for asset in book_assets if asset.type == "epub"][0]
    except IndexError:
        size = None

    book = Book(
        public_id=f"{SOURCE_ID}:{pg_book_id}",
        slug=f"{SOURCE_ID}-{pg_book_id}-{slugify(title[:50] or '')}",
        source=SOURCE_ID,
        title=title,
        subtitle=subtitle,
        lang=lang,
        assets=book_assets,
        size=size,
        additional_data=BookAdditionalData(intro=raw_book["intro"]),  # type: ignore
    )
    authors = _get_authors(rdf_data)
    genres = _get_genres(rdf_data)

    return LibraryBookData(book, authors, genres)


def _get_authors(rdf_data: ET.Element) -> list[Author]:
    authors = []

    authors_data = rdf_data.findall(".//pgterms:agent", GUTENBERG_XML_NAMESPACES)
    for author_data in authors_data:

        # Author ID
        pg_agent_str = author_data.attrib[f"{{{GUTENBERG_XML_NAMESPACES['rdf']}}}about"]
        pg_agent_match = _AUTHOR_ID_FROM_PG_AGENT_REGEX.search(pg_agent_str)
        if not pg_agent_match:
            logger.warning("PG agent string '%s' doesn't match the expected format", pg_agent_str)
            continue
        pg_author_id = int(pg_agent_match.group(1))

        # Name, first name, last name
        name = author_data.findtext("./pgterms:name", None, GUTENBERG_XML_NAMESPACES)
        last_name, first_name = None, None
        if name:
            name_list = name.split(",")
            if len(name_list) == 2:
                last_name, first_name = [item.strip() for item in name_list]

        # Birth and death dates
        birth_year = author_data.findtext("./pgterms:birthdate", None, GUTENBERG_XML_NAMESPACES)
        death_year = author_data.findtext("./pgterms:deathdate", None, GUTENBERG_XML_NAMESPACES)

        author = Author(
            public_id=f"{SOURCE_ID}:{pg_author_id}",
            slug=f"{SOURCE_ID}-{pg_author_id}-{slugify(first_name or '')}-{slugify(last_name or '')}",
            source=SOURCE_ID,
            first_name=first_name,
            last_name=last_name,
            birth_year=birth_year,
            death_year=death_year,
        )
        authors.append(author)

    return authors


def _get_genres(rdf_data: ET.Element) -> list[Genre]:
    genres_raw = [
        el.text for el in rdf_data.findall(".//dcterms:subject/rdf:Description/rdf:value", GUTENBERG_XML_NAMESPACES)
    ]

    return [Genre.from_name(genre_name) for genre_name in genres_raw if genre_name]


def _get_book_assets(raw_book: BookToParse) -> list[BookAsset]:
    return [
        BookAsset(type=cast(BookAssetType, suffix[1:]), size=file_size)
        for file_name, file_size in raw_book["assets_sizes"].items()
        if (suffix := PurePath(file_name).suffix) in BOOK_ASSET_SUFFIXES
    ]
