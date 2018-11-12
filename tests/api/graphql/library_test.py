from pathlib import Path

from api.graphql.schema import schema as api_schema
from infra.redis import redis_client, redis_host
from library_import.gutenberg import get_book_to_parse_data, parse_book
from library_import.redis import store_book_in_redis
from walrus import Database

autocomplete_db = Database(redis_host).autocomplete()


def test_basic_book_retrieval():
    sut_book_id = "pg:345"
    sut_provider, sut_id = sut_book_id.split(":")

    _flush_redis_db()
    _store_book_in_redis(sut_id)

    query = """
    query bookById($id: ID!) {
        book(id: $id) {
        
            id
            provider
            title
            lang
            genres
            
            assets {
                epub {
                   exists
                   size
                }
                mobi {
                   exists
                   size
                }
            }
            
        }
    }
    """
    result = api_schema.execute(query, variables={"id": sut_book_id})

    assert isinstance(result.data, dict)
    assert "book" in result.data
    assert "id" in result.data["book"] and result.data["book"]["id"] == sut_book_id
    assert "provider" in result.data["book"] and result.data["book"]["provider"] == sut_provider
    assert "title" in result.data["book"] and result.data["book"]["title"] == "Dracula"
    assert "lang" in result.data["book"] and result.data["book"]["lang"] == "en"
    assert "genres" in result.data["book"] and "Vampires -- Fiction" in result.data["book"]["genres"]
    assert "assets" in result.data["book"] and isinstance(result.data["book"]["assets"], dict)
    assert result.data["book"]["assets"]["epub"] == {"exists": True, "size": 22}
    assert result.data["book"]["assets"]["mobi"] == {"exists": False, "size": 0}


def _flush_redis_db():
    redis_client.flushdb()


def _store_book_in_redis(pg_book_id: int) -> None:
    rdf_path = Path(
        __file__).parent.parent.parent / "fixtures" / "project_gutenberg_books" / str(
        pg_book_id) / f"pg{pg_book_id}.rdf"
    book_to_parse = get_book_to_parse_data(pg_book_id, rdf_path.resolve())
    book = parse_book(book_to_parse)
    store_book_in_redis(redis_client, autocomplete_db, book)
