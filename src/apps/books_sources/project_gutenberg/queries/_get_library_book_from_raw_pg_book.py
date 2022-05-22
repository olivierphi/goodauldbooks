import re
import typing as t

import xml.etree.ElementTree as ET
from pathlib import PurePath

from ..constants import GUTENBERG_XML_NAMESPACES, SOURCE_ID, BOOK_ASSET_SUFFIXES
from ..collection_indexing import models
from apps.library.domain import Book, BookAsset, Author, BookAssetType

_AUTHOR_ID_FROM_PG_AGENT_REGEX = re.compile(r"/(\d+)$")


def get_library_book_from_raw_pg_book(*, raw_book: models.RawBook) -> t.Optional[Book]:
    rdf_data = ET.fromstring(raw_book.rdf_content)

    return _get_book(rdf_data, raw_book)


def _get_book(rdf_data: ET.Element, raw_book: models.RawBook) -> t.Optional[Book]:
    title = rdf_data.findtext(".//dcterms:title", None, GUTENBERG_XML_NAMESPACES)
    if not title:
        return None

    lang = rdf_data.findtext(".//dcterms:language/rdf:Description/rdf:value", None, GUTENBERG_XML_NAMESPACES)

    genres = [
        el.text for el in rdf_data.findall(".//dcterms:subject/rdf:Description/rdf:value", GUTENBERG_XML_NAMESPACES)
    ]

    # Do we have a "[title]; [subtitle]" pattern in this book's title?
    title_list = title.split(";", maxsplit=1)
    if len(title_list) > 1:
        title = title_list[0].strip()
        subtitle = title_list[1].strip()
    else:
        subtitle = None

    return Book(
        provider=SOURCE_ID,
        id=f"{SOURCE_ID}:{raw_book.pg_id}",
        title=title,
        subtitle=subtitle,
        lang=lang,
        genres=genres,
        assets=_get_book_assets(raw_book),
        authors=_get_authors(rdf_data),
        intro=raw_book.intro,
    )


def _get_authors(rdf_data: ET.Element) -> list[Author]:
    authors = []

    authors_data = rdf_data.findall(".//pgterms:agent", GUTENBERG_XML_NAMESPACES)
    for author_data in authors_data:
        # Author Id
        pg_agent_str = author_data.attrib[f"{{{GUTENBERG_XML_NAMESPACES['rdf']}}}about"]
        pg_author_id = int(_AUTHOR_ID_FROM_PG_AGENT_REGEX.search(pg_agent_str).group(1))
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
            provider=SOURCE_ID,
            id=f"{SOURCE_ID}:{pg_author_id}",
            name=name,
            first_name=first_name,
            last_name=last_name,
            birth_year=birth_year,
            death_year=death_year,
        )
        authors.append(author)

    return authors


def _get_book_assets(raw_book: models.RawBook) -> list[BookAsset]:
    return [
        BookAsset(type=BookAssetType(suffix[1:]), size=file_size)
        for file_name, file_size in raw_book.assets_sizes.items()
        if (suffix := PurePath(file_name).suffix) in BOOK_ASSET_SUFFIXES
    ]
