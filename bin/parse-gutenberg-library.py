import sys
from pathlib import Path


def _init_path():
    src_path = str((Path(__file__) / ".." / ".." / "src").resolve())
    if src_path not in sys.path:
        sys.path.append(src_path)


if __name__ == "__main__":
    import json
    import typing as t

    from walrus import Database

    _init_path()

    from infra.redis import redis_host, redis_client
    from library_import import pg_import
    from library_import.domain import Book, Author
    from library.utils import get_genre_hash

    base_folder_str = sys.argv[1]
    base_folder = Path(base_folder_str)

    autocomplete_db = Database(redis_host).autocomplete()


    def _on_book_parsed(book: Book, author: t.Optional[Author]):
        book_id = f"book:pg:{book.gutenberg_id}"
        book_dict = book._asdict()

        if book_dict["genres"]:
            genres_hashes_mapping = {get_genre_hash(g): g for g in book_dict["genres"]}

            # save "genres:hashes_mapping" keys for this book
            redis_client.hmset("genres:hashes_mapping", genres_hashes_mapping)
            # save "genres:hashes_mapping_reversed" keys for this book
            genres_hashes_mapping_reversed = {title: hash for hash, title in genres_hashes_mapping.items()}
            redis_client.hmset("genres:hashes_mapping_reversed", genres_hashes_mapping_reversed)

            # save "genres:stats:books_by_lang:[genre_hash]" keys for this book
            for genre_hash in genres_hashes_mapping:
                redis_client.hincrby(
                    f"genres:stats:books_by_lang:{genre_hash}", "__all__", 1
                )
                redis_client.hincrby(
                    f"genres:stats:books_by_lang:{genre_hash}", book_dict["lang"], 1
                )

            book_dict["genres"] = list(genres_hashes_mapping.keys())

        book_dict["assets"] = {
            asset_type.type.name: asset_type.size for asset_type in book_dict["assets"]
        }

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

        # save "book:pg:[id]"
        redis_client.set(book_id, json.dumps(book_dict))

        if author:
            author_dict = author._asdict()
            # save "author:pg:[id]"
            redis_client.set(author_id, json.dumps(author_dict))


    nb_pg_rdf_files_found = pg_import.traverse_library(base_folder, _on_book_parsed)

    print("\n", nb_pg_rdf_files_found, " RDF files found and parsed")
    print(list(autocomplete_db.search("well")))
