import json

from library.utils import get_genre_hash
from redis import StrictRedis
from walrus import Autocomplete
from .domain import Book


def store_book_in_redis(
    redis_client: StrictRedis, autocomplete_db: Autocomplete, book: Book
):
    book_id = f"{book.provider}:{book.id}"
    book_redis_key = f"book:{book_id}"
    book_dict = book._asdict()

    if book_dict["genres"]:
        genres_hashes_mapping = {get_genre_hash(g): g for g in book_dict["genres"]}

        # save "genres:hashes_mapping" keys for this book
        redis_client.hmset("genres:hashes_mapping", genres_hashes_mapping)
        # save "genres:hashes_mapping_reversed" keys for this book
        genres_hashes_mapping_reversed = {
            title: hash for hash, title in genres_hashes_mapping.items()
        }
        redis_client.hmset(
            "genres:hashes_mapping_reversed", genres_hashes_mapping_reversed
        )

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
            obj_type="book",
            obj_id=book_redis_key,
            title=book.title,
            data=book_redis_key,
        )

    if book.authors:
        # TODO: handle multiple authors
        author = book.authors[0]
        author_redis_key = f"author:{author}"
        author_id = f"{author.provider}:{author.id}"
        book_dict["author_ids"] = [author_id]
        autocomplete_db.store(
            obj_type="author",
            obj_id=author_redis_key,
            title=author.name,
            data=author_redis_key,
        )
        author_dict = author._asdict()
        # save "author:[provider]:[id]"
        redis_client.set(author_redis_key, json.dumps(author_dict))

    # save "book:[provider]:[id]"
    redis_client.set(book_redis_key, json.dumps(book_dict))
