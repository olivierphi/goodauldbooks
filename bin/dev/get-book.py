import sys
import time

book_full_id = sys.argv[1]
provider, id = book_full_id.split(":")

from library.repository import get_book

start_time = time.monotonic()
print(get_book(provider, id))
duration = round(time.monotonic() - start_time, 1)
print(f"Took {duration}s.")
