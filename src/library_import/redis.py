import json

from infra import redis_key
from library import utils
from library.domain import Book, LANG_ALL
from redis import StrictRedis
from walrus import Autocomplete

BOOKS_BY_GENRE_COMPUTATION_NB_GENRES_BY_BATCH = 30


def store_book_in_redis(
        redis_client: StrictRedis, autocomplete_db: Autocomplete, book: Book
):
    # TODO: split that ugly function into separate elegant functions :-)
    book_dict = {
        "provider": book.provider,
        "id": book.id,
        "title": book.title,
        "lang": book.lang,
        "genres": [],
        "assets": [],
        "authors_ids": [],
    }

    if book.genres:
        genres_hashes_mapping = {utils.get_genre_hash(g): g for g in book.genres}

        # save "genres:hashes_mapping" keys for this book
        redis_client.hmset(redis_key.genres_hashes_mapping(), genres_hashes_mapping)
        # save "genres:hashes_mapping_reversed" keys for this book (could be useful)
        genres_hashes_mapping_reversed = {
            title: hash for hash, title in genres_hashes_mapping.items()
        }
        redis_client.hmset(
            redis_key.genres_hashes_mapping_reversed(), genres_hashes_mapping_reversed
        )

        # save "genres:stats:books_by_lang:[genre_hash]" keys for this book
        for genre_hash in genres_hashes_mapping:
            genre_nb_books_by_lang_redis_key = redis_key.stats_genre_nb_books_by_lang(
                genre_hash
            )
            redis_client.hincrby(genre_nb_books_by_lang_redis_key, LANG_ALL, 1)
            redis_client.hincrby(genre_nb_books_by_lang_redis_key, book_dict["lang"], 1)

        book_dict["genres"] = list(genres_hashes_mapping.keys())

    book_dict["assets"] = {
        asset_type.type.name: asset_type.size for asset_type in book.assets
    }

    if book.authors:
        # TODO: handle multiple authors
        author = book.authors[0]
        author_id = f"{author.provider}:{author.id}"
        author_redis_key = redis_key.author(author.provider, author.id)
        book_dict["authors_ids"].append(author_id)
        autocomplete_db.store(
            obj_type="author",
            obj_id=author_redis_key,
            title=author.name,
            data=author_redis_key,
        )
        author_dict = author._asdict()
        # Save the "author:[provider]:[id]" hash
        redis_client.hmset(author_redis_key, author_dict)
        # Save the slugified name of that author in our authors names Redis sorted set
        author_slug = utils.get_author_slug(author)
        redis_client.zadd(redis_key.authors_slugs(), 0, author_slug)

    book_redis_key = redis_key.book(book.provider, book.id)
    if book.title:
        autocomplete_db.store(
            obj_type="book",
            obj_id=book_redis_key,
            title=book.title,
            data=book_redis_key,
        )

    # Save the "book:[provider]:[id]" hash, after a bit of serialisation and cleaning
    book_dict["genres"] = json.dumps(book_dict["genres"])
    book_dict["assets"] = json.dumps(book_dict["assets"])
    book_dict["authors_ids"] = json.dumps(book_dict["authors_ids"])
    redis_client.hmset(book_redis_key, book_dict)

    # Save the slugified title of that book in our books titles Redis sorted set
    book_slug = utils.get_book_slug(book)
    redis_client.zadd(redis_key.books_slugs(), 0, book_slug)


def compute_books_by_genre(redis_client: StrictRedis):
    nb_genres_computed = 0
    books_slugs_redis_key = redis_key.books_slugs()
    while True:
        current_batch_start = nb_genres_computed
        current_batch_stop = (
                current_batch_start + BOOKS_BY_GENRE_COMPUTATION_NB_GENRES_BY_BATCH
        )

        # Take the next n items of our alphabetically sorted (by Redis) books slugs
        next_books_batch = redis_client.zrange(
            books_slugs_redis_key, current_batch_start, current_batch_stop
        )

        if not next_books_batch:
            break  # all books done! :-)

        for i, book_slug in enumerate(next_books_batch):
            provider, id = utils.get_provider_and_id_from_book_slug(book_slug)
            book_id = f"{provider}:{id}"
            book_lang = redis_client.hget(redis_key.book(provider, id), "lang")
            # For each book, get its genres:
            book_genres_raw = redis_client.hget(redis_key.book(provider, id), "genres")
            books_genres_hashes = json.loads(book_genres_raw)
            for genre_hash in books_genres_hashes:
                # And add this book to this genre "book_by_genre" sorted set,
                # with the current book position in the alphabetically sorted set as score.
                for lang in (book_lang, LANG_ALL):
                    books_for_this_genre__and_lang_redis_key = redis_key.books_by_genre(
                        genre_hash, lang
                    )
                    book_score = current_batch_start + i
                    redis_client.zadd(
                        books_for_this_genre__and_lang_redis_key, book_score, book_id
                    )

        nb_genres_computed += len(next_books_batch)
