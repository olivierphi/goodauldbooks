import sqlite3
import sys
from pathlib import Path


def _init_path():
    src_path = str((Path(__file__).parent.parent / "src").resolve())
    if src_path not in sys.path:
        sys.path.append(src_path)


def store_raw_gutenberg_library_in_db(base_folder: Path) -> int:
    from library_import import pg_import

    db_path = Path(__file__).parent.parent / "raw_books.db"
    if db_path.exists():
        db_path.unlink()
    db_con = sqlite3.connect(db_path)

    pg_import.init_raw_books_db(db_con)

    def on_book_batch_stored(nb_books_in_batch: int) -> None:
        print("." * nb_books_in_batch, flush=True)

    pg_import.traverse_library_and_store_raw_data_in_db(base_folder, db_con, on_book_batch_stored)

    return db_con.execute("select count(*) from raw_book").fetchone()[0]


if __name__ == "__main__":
    import time

    _init_path()

    base_folder_str = sys.argv[1]
    base_folder = Path(base_folder_str)

    start_time = time.monotonic()
    nb_pg_rdf_files_found = store_raw_gutenberg_library_in_db(base_folder)

    print(f"\n{nb_pg_rdf_files_found} books found and stored in DB in {round(time.monotonic() - start_time, 1)}s.")
