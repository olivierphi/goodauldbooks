import json
import sys
import time

from infra.redis import redis_host, redis_client
from library.utils import get_genres_from_hashes
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
        library_item = redis_client.hgetall(library_item_id)

        if "author_ids" in library_item and library_item["author_ids"]:
            author_ids = json.loads(library_item["author_ids"])
            authors_redis_keys = [f"author:{author_id}" for author_id in author_ids]
            library_item["authors"] = []
            for author_redis_key in authors_redis_keys:
                author_library_item = redis_client.hgetall(author_redis_key)
                library_item["authors"].append(author_library_item)

        if "genres" in library_item and library_item["genres"]:
            genres_hashes = json.loads(library_item["genres"])
            genres_titles = get_genres_from_hashes(genres_hashes)
            genres_stats_raw = [
                redis_client.hgetall(f"genres:stats:books_by_lang:{h}")
                for h in genres_hashes
            ]
            library_item["genres_with_stats"] = {
                genres_titles[i]: genre_stats_raw
                for i, genre_stats_raw in enumerate(genres_stats_raw)
            }

        print(library_items_ids[i], json.dumps(library_item, indent=2))
