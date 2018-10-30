import sys
from pathlib import Path


def _init_path():
    src_path = str((Path(__file__) / ".." / ".." / "src").resolve())
    if src_path not in sys.path:
        sys.path.append(src_path)


if __name__ == "__main__":
    import json
    import os
    import typing as t

    import redis
    from walrus import Database

    _init_path()

    from library_import import pg_import
    from library_import.domain import Book, Author

    base_folder_str = sys.argv[1]
    base_folder = Path(base_folder_str)

    redis_host = os.getenv("REDIS_HOST", "redis")

    autocomplete_db = Database(redis_host).autocomplete()
    redis_client = redis.StrictRedis(host=redis_host)

    def _on_book_parsed(book: Book, author: t.Optional[Author]):
        book_id = f"book:pg:{book.gutenberg_id}"
        book_dict = book._asdict()

        if book.title:
            autocomplete_db.store(
                obj_type="book", obj_id=book_id, title=book.title, data=book_id
            )

        if author and author.name:
            author_id = f"author:pg:{author.gutenberg_id}"
            book_dict["author_ids"] = [author_id]
            autocomplete_db.store(
                obj_type="author", obj_id=author_id, title=author.name, data=author_id
            )

        redis_client.set(book_id, json.dumps(book_dict))

        if author:
            author_dict = author._asdict()
            redis_client.set(author_id, json.dumps(author_dict))

    nb_pg_rdf_files_found = pg_import.traverse_library(base_folder, _on_book_parsed)

    print("\n", nb_pg_rdf_files_found, " RDF files found and parsed")
    print(list(autocomplete_db.search("well")))
