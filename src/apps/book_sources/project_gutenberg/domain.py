import re
import typing as t
from pathlib import Path
from string import Template

from apps.library import domain as library_domain

PROVIDER_ID = "gu"

BOOK_INTRO_SIZE = (
    5000
)  # the number of first characters we'll take in a book to define its "intro"

EPUB_FILE_REGEX = re.compile("^pg(\d+)\.epub$")
RDF_FILE_REGEX = re.compile(r"^pg(\d+)\.rdf$")

RDF_CONTENT_PATTERNS_DENYLIST = (
    # We choose to not store the books for which the RDF file matches these regexs, for various reasons.
    re.compile("<rdf:value>AP</rdf:value>"),
    re.compile("<pgterms:name>Library of Congress. Copyright Office</pgterms:name>"),
)

GUTENBERG_XML_NAMESPACES = {
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "dcterms": "http://purl.org/dc/terms/",
    "pgterms": "http://www.gutenberg.org/2009/pgterms/",
}
AUTHOR_ID_FROM_PG_AGENT_REGEX = re.compile(r"/(\d+)$")
ASSETS_TEMPLATES = {
    library_domain.BookAssetType.EPUB: Template("pg${pg_book_id}.epub"),
    library_domain.BookAssetType.MOBI: Template("pg${pg_book_id}.mobi"),
}

# We could have used SQL Alchemy to handle that SQLite "transitional" database, but it's quite low-level
# and only used as a transition between the Project Gutenberg books file tree and our Postgres database
#  - so let's keep it simple and stupid (and low-level).
RAW_BOOKS_DB_SQL_TABLE_CREATION = """\
create table raw_book(
    pg_book_id int not null, 
    rdf_content text not null,
    dir_files_sizes text not null,
    has_intro int(1) not null, 
    intro text,
    has_cover int(1) not null
);
"""


class BookToParse(t.NamedTuple):
    pg_book_id: int  # the book id in the Project Gutenberg database
    rdf_content: str
    dir_files_sizes: t.Dict[str, int]
    has_intro: bool
    has_cover: bool
    intro: str = None


class BookToParseFilterFunc(t.Protocol):
    def __call__(self, *, book_to_parse: BookToParse) -> bool:
        ...


OnBookRdf = t.Callable[[int, Path], t.Any]
OnBookParsed = t.Callable[[library_domain.Book], t.Any]
