import re
from pathlib import Path
from typing import Any, Callable, TypeAlias

RDF_FILE_REGEX = re.compile(r"^pg(\d+)\.rdf$")
OnBookRdf: TypeAlias = Callable[[int, Path], Any]


def traverse_collection(*, base_folder: Path, on_book_rdf: OnBookRdf, traversal_limit: int = 0) -> int:
    pg_rdf_files_found_count = 0

    for rdf_file_path in base_folder.glob("*/*.rdf"):
        rdf_file_match = RDF_FILE_REGEX.fullmatch(rdf_file_path.name)
        if not rdf_file_match:
            continue

        pg_rdf_files_found_count += 1

        pg_book_id = rdf_file_match[1]

        on_book_rdf(int(pg_book_id), rdf_file_path)

        if pg_rdf_files_found_count == traversal_limit:
            break

    return pg_rdf_files_found_count
