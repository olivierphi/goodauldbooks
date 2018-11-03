import sys
import time

from infra.redis import redis_client
from library.repository import get_books_by_genre
from library.utils import get_genre_hash

genre_name = sys.argv[1]
start = int(sys.argv[2])
limit = int(sys.argv[3])

genre_hash = get_genre_hash(genre_name)
print(f"This genre hash is '{genre_hash}'.")

print(f"Checking that we do have this genre in the database...")
exists = redis_client.hexists("genres:hashes_mapping", genre_hash)
if not exists:
    print(f"We have no genre '{genre_name}'. Exiting.")
    sys.exit(1)
print("Checked.")

start_time = time.monotonic()
print(get_books_by_genre(genre_hash, start, limit))
duration = round(time.monotonic() - start_time, 1)
print(f"Took {duration}s.")
