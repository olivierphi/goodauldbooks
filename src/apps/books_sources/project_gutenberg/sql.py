# We could have used Django ORM to handle that SQLite database, but it's quite low-level
# and only used as a transition between the Project Gutenberg books file tree and our Postgres database
# so let's keep it simple and stupid, and scoped in this Django app rather than being a globally configured DB
# in the Django settings.
RAW_BOOKS_DB_SQL_TABLE_CREATION = """\
create table raw_book(
    pg_book_id int not null, 
    rdf_content text not null,
    assets_sizes text not null,
    has_intro int(1) not null, 
    intro text,
    has_cover int(1) not null
)
"""

RAW_BOOKS_DB_SQL_TABLE_DROP = """\
drop table if exists raw_book
"""

RAW_BOOKS_DB_SQL_INSERT = """\
insert into raw_book
    (pg_book_id, rdf_content, assets_sizes, has_intro, intro, has_cover)
values
    (:pg_book_id, :rdf_content, :assets_sizes, :has_intro, :intro, :has_cover)
"""

RAW_BOOKS_DB_SQL_SELECT = """\
select
    pg_book_id, rdf_content, assets_sizes, has_intro, intro, has_cover
from
    raw_book
"""
