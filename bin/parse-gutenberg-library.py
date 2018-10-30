import sys
from pathlib import Path


def _init_path():
    src_path = str((Path(__file__) / ".." / ".." / "src").resolve())
    if src_path not in sys.path:
        sys.path.append(src_path)


if __name__ == "__main__":
    _init_path()

    from library_import import pg_import

    base_folder_str = sys.argv[1]
    base_folder = Path(base_folder_str)
    nb_pg_rdf_files_found = pg_import.traverse_library(base_folder)
    print(nb_pg_rdf_files_found)
