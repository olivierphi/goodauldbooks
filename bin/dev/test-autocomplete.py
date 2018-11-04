import json
import sys
import time

from infra import redis_key
from infra.redis import redis_host, redis_client
from library.domain import Book, Author
from library.repository import get_author, get_book
from library.utils import get_genres_hashes
from walrus import Database

search = sys.argv[1]
limit = None
if len(sys.argv) > 2:
    limit = int(sys.argv[2])

boosts = {
    # Marry Shelley rocks
    "author:pg:61": 1.8,
    "book:pg:84": 1.8,
    # Dracula is a fantastic book
    "book:pg:345": 1.8,
    # Robert Louis Stevenson was a great author and he was Scottish ❤ , what a man
    "author:pg:35": 1.7,
    # Big up to Victor Hugo as well
    "author:pg:85": 1.6,
    # Jules Verne we don't forget you
    "author:pg:60": 1.6,
}

autocomplete_db = Database(host=redis_host).autocomplete(cache_timeout=2)

for boost_obj_full_id, boost_score in boosts.items():
    autocomplete_db.boost_object(obj_id=boost_obj_full_id, multiplier=boost_score)

start_time = time.time_ns()
results = autocomplete_db.search(search, limit=limit)
print(f"Redis search done in {(time.time_ns() - start_time) / 1000}µs.", flush=True)

results_list = list(results)
if not results_list:
    print("No results.")
else:
    library_items_ids = results_list

    for i, library_item_id in enumerate(library_items_ids):
        library_item_type = None
        if library_item_id[0:5] == "book:":
            library_item_type = Book
            _, book_provider, book_id = library_item_id.split(":")
            library_item = get_book(book_provider, book_id)
        elif library_item_id[0:6] == "author:":
            library_item_type = Author
            _, author_provider, author_id = author_id.split(":")
            library_item = get_author(author_provider, author_id)
        else:
            raise Exception(f"Unknown library item id pattern '{library_item_id}'")

        library_item_dict = library_item._asdict()

        if library_item_type is Book and library_item.genres:
            genres_hashes = get_genres_hashes(library_item.genres)
            genres_stats_raw = [
                redis_client.hgetall(redis_key.stats_genre_nb_books_by_lang(hash))
                for hash in genres_hashes
            ]
            library_item_dict["genres_with_stats"] = {
                library_item.genres[i]: genre_stats_raw
                for i, genre_stats_raw in enumerate(genres_stats_raw)
            }

        print(library_items_ids[i], json.dumps(library_item_dict, indent=2))
