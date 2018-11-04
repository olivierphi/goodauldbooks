import sys
import time

from infra import redis_key
from infra.redis import redis_client
from library.repository import get_books_by_author

author_id = sys.argv[1]
lang = sys.argv[2]
start = int(sys.argv[3])
limit = int(sys.argv[4])

provider, id = author_id.split(":")

print(f"Checking that we do have this author in the database...")
exists = redis_client.exists(redis_key.author(provider, id))
if not exists:
    print(f"We have no author '{author_id}'. Exiting.")
    sys.exit(1)
print("Checked.", "\n")

langs_for_that_author = []
lang_for_that_author_keys_pattern = redis_key.books_by_author(provider, id, "*")
for key in redis_client.scan_iter(match=lang_for_that_author_keys_pattern):
    langs_for_that_author.append(key.split(":")[-1])
print(
    f"We have books in \033[93m{len(langs_for_that_author)}\033[0m langs for that author (\033[93m{','.join(langs_for_that_author)}\033[0m)."
)

nb_books_for_that_author_and_lang = redis_client.zcard(
    redis_key.books_by_author(provider, id, lang)
)
print(
    f"We have \033[93m{nb_books_for_that_author_and_lang}\033[0m books for that author and lang (\033[93m{lang}\033[0m).",
    f"Let's display \033[93m{limit}\033[0m items from index \033[93m{start}\033[0m.",
)

print("")
start_time = time.monotonic()
books_by_author = get_books_by_author(provider, id, lang, start, limit)
for book in books_by_author:
    print(book, "\n")
duration = round(time.monotonic() - start_time, 1)
print(f"Took {duration}s.")
