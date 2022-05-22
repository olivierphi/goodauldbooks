from pathlib import Path

from ..collection_indexing import db, helpers, models
from ..queries import get_book_to_parse_from_book_rdf, traverse_collection


def index_collection_in_db(
    *,
    collection_path: Path,
    db_create_schema: bool,
    db_destroy_schema_first: bool,
    traversal_limit: int = 0,
):
    if db_create_schema:
        helpers.create_schema(drop_all_first=db_destroy_schema_first)

    with db.get_db_session() as db_session:

        def on_book_rdf_callback(pg_book_id: int, rdf_file_path):
            raw_book = _get_raw_book_from_rdf(pg_book_id, rdf_file_path)
            db_session.add(raw_book)

        traverse_collection(
            base_folder=collection_path,
            on_book_rdf=on_book_rdf_callback,
            traversal_limit=traversal_limit,
        )

        db_session.commit()


def _get_raw_book_from_rdf(pg_book_id: int, rdf_file_path: Path) -> models.RawBook:
    book_to_parse = get_book_to_parse_from_book_rdf(pg_book_id=pg_book_id, rdf_file_path=rdf_file_path)

    return models.RawBook(
        pg_id=book_to_parse.pg_book_id,
        rdf_content=book_to_parse.rdf_content,
        assets_sizes=book_to_parse.assets_sizes,
        has_intro=book_to_parse.has_intro,
        has_cover=book_to_parse.has_cover,
        intro=book_to_parse.intro,
    )
