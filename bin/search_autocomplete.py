import json
import os
import sys

import redis
from walrus import Database

if __name__ == "__main__":
    search = sys.argv[1]
    limit = None
    if len(sys.argv) > 2:
        limit = int(sys.argv[2])

    redis_host = os.getenv("REDIS_HOST", "redis")

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

    results = autocomplete_db.search(search, limit=limit)
    results_list = list(results)
    if not results_list:
        print("No results.")
    else:
        library_items_ids = results_list

        redis_client = redis.StrictRedis(host=redis_host)
        objects = redis_client.mget(library_items_ids)
        for i, library_item_serialised in enumerate(objects):
            library_item = json.loads(library_item_serialised)
            if "author_ids" in library_item:
                authors_serialised = redis_client.mget(library_item["author_ids"])
                authors = [json.loads(auth) for auth in authors_serialised]
                library_item["authors"] = authors
            print(library_items_ids[i], json.dumps(library_item, indent=2))
