from pathlib import Path
import typing as t

from .. import domain, _logger


def crawl_rsynced_library(
    *, base_folder: Path, on_book_rdf: domain.OnBookRdf, limit: t.Optional[int] = None
) -> int:
    found_pg_rdf_files_count = 0

    for rdf_file in base_folder.glob("*/*.rdf"):
        rdf_file_match = domain.RDF_FILE_REGEX.fullmatch(rdf_file.name)
        if not rdf_file_match:
            continue

        found_pg_rdf_files_count += 1

        pg_book_id = rdf_file_match[1]

        on_book_rdf(int(pg_book_id), rdf_file)

        if found_pg_rdf_files_count == limit:
            _logger.logger.warning(
                f"Stopping library traversal because of limit '{limit}'"
            )
            break

    return found_pg_rdf_files_count
