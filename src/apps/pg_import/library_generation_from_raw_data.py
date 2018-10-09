from django.db import connection

LIBRARY_GENERATION_FROM_RAW_DATA_SQL = """\
select 
  *
from 
  import_create_books_from_raw_rdfs(wipe_previous_books => true)
"""


def generate_library_from_raw_gutenberg_data() -> int:
    with connection.cursor() as db_cursor:
        db_cursor.execute(LIBRARY_GENERATION_FROM_RAW_DATA_SQL)
        row = db_cursor.fetchone()
        return row[0]  # the number of books created
