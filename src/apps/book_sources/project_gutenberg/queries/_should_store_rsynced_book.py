from .. import domain


def should_store_rsynced_book(*, book_to_parse: domain.BookToParse) -> bool:
    """Implements domain.BookToParseFilterFunc"""
    if not _has_epub(book_to_parse):
        return False
    if _is_in_deny_list(book_to_parse):
        return False

    return True


def _has_epub(book_to_parse: domain.BookToParse) -> bool:
    dir_files_sizes = book_to_parse.dir_files_sizes
    for file_name in dir_files_sizes.keys():
        if domain.EPUB_FILE_REGEX.match(file_name):
            return True
    return False


def _is_in_deny_list(book_to_parse: domain.BookToParse) -> bool:
    for blacklist_pattern in domain.RDF_CONTENT_PATTERNS_DENYLIST:
        if blacklist_pattern.match(book_to_parse.rdf_content):
            return True
    return False
