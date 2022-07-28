import re

from .types import BookToParse

_EPUB_FILE_REGEX = re.compile(r"^pg(\d+)\.epub$")
_RDF_CONTENT_PATTERNS_EXCLUDE_LIST = (
    re.compile(r"<rdf:value>AP</rdf:value>"),
    re.compile(r"<pgterms:name>Library of Congress. Copyright Office</pgterms:name>"),
)


def is_book_satisfying_filters(book_to_parse: BookToParse) -> bool:
    if not _has_epub(book_to_parse):
        return False
    if _is_part_of_exclude_list(book_to_parse):
        return False

    return True


def _has_epub(book_to_parse: BookToParse) -> bool:
    dir_files_sizes = book_to_parse["assets_sizes"]
    for file_name in dir_files_sizes.keys():
        if _EPUB_FILE_REGEX.match(file_name):
            return True
    return False


def _is_part_of_exclude_list(book_to_parse: BookToParse) -> bool:
    for exclude_list_pattern in _RDF_CONTENT_PATTERNS_EXCLUDE_LIST:
        if exclude_list_pattern.match(book_to_parse["rdf_content"]):
            return True
    return False
