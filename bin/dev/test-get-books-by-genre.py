import sys
import time

from infra import redis_key
from infra.redis import redis_client
from library.repository import get_books_by_genre
from library.utils import get_genre_hash

genre_name = sys.argv[1]
lang = sys.argv[2]
start = int(sys.argv[3])
limit = int(sys.argv[4])

genre_hash = get_genre_hash(genre_name)
print(f"This genre hash is '{genre_hash}'.")

print(f"Checking that we do have this genre in the database...")
exists = redis_client.hexists(redis_key.genres_hashes_mapping(), genre_hash)
if not exists:
    print(f"We have no genre '{genre_name}'. Exiting.")
    sys.exit(1)
print("Checked.", "\n")

langs_for_that_genre = []
lang_for_that_genre_keys_pattern = redis_key.books_by_genre(genre_hash, "*")
for key in redis_client.scan_iter(match=lang_for_that_genre_keys_pattern):
    langs_for_that_genre.append(key.split(":")[-1])
print(
    f"We have books in \033[93m{len(langs_for_that_genre)}\033[0m langs for that genre (\033[93m{','.join(langs_for_that_genre)}\033[0m)."
)

nb_books_for_that_genre_and_lang = redis_client.zcard(
    redis_key.books_by_genre(genre_hash, lang)
)
print(
    f"We have \033[93m{nb_books_for_that_genre_and_lang}\033[0m books for that genre and lang (\033[93m{lang}\033[0m).",
    f"Let's display \033[93m{limit}\033[0m items from index \033[93m{start}\033[0m.",
)

print("")
start_time = time.monotonic()
books_by_genre = get_books_by_genre(genre_hash, lang, start, limit)
for book in books_by_genre:
    print(book, "\n")
duration = round(time.monotonic() - start_time, 1)
print(f"Took {duration}s.")
