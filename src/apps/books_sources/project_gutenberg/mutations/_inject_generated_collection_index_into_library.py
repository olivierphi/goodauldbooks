from typing import Sequence

from sqlalchemy.future import select
from slugify import slugify

from apps.library import db as library_db
from apps.library import models as library_models, helpers as library_helpers
from apps.library.domain import Book
from ..collection_indexing import db, models
from ..queries import get_library_book_from_raw_pg_book

_BATCH_SIZE = 200


def inject_generated_collection_index_into_library(
    *,
    db_create_schema: bool,
    db_destroy_schema_first: bool,
    traversal_limit: int = 0,
):
    if db_create_schema:
        library_helpers.create_schema(drop_all_first=db_destroy_schema_first)

    stmt = select(models.RawBook).execution_options(yield_per=_BATCH_SIZE)
    if traversal_limit:
        stmt = stmt.limit(traversal_limit)
    with db.get_db_session() as collection_index_db_session, library_db.get_db_session() as library_db_session:
        for partition in collection_index_db_session.scalars(stmt).partitions():
            for raw_book in partition:  # type: models.RawBook
                book = get_library_book_from_raw_pg_book(raw_book=raw_book)
                library_model_book = _get_library_models_for_book(book)
                library_db_session.add(library_model_book)

            library_db_session.commit()


def _get_library_models_for_book(book: Book) -> library_models.Book:
    book_model = library_models.Book(
        public_id=book.id,
        slug=f"{book.id}-{slugify(book.title)}",
        title=book.title,
        subtitle=book.subtitle,
        lang=book.lang,
    )

    author_models = [
        library_models.Author(
            public_id=author.id,
            slug=f"{author.id}-{slugify(author.full_name())}",
            first_name=author.first_name,
            last_name=author.last_name,
            birth_year=author.birth_year,
            death_year=author.death_year,
        )
        for author in book.authors
    ]

    genre_models = [library_models.Genre.from_name(genre_name) for genre_name in book.genres]

    book_model.authors = author_models
    book_model.genres = genre_models

    return book_model
