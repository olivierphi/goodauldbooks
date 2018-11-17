from pathlib import Path

import library_import.redis
from api.graphql.schema import schema as api_schema
from library import mutations
from library.domain import LANG_ALL
from library_import.gutenberg import get_book_to_parse_data, parse_book
from redis import StrictRedis
from walrus import Autocomplete


def test_basic_book_retrieval(redis_client: StrictRedis, autocomplete_db: Autocomplete):
    test_book_full_id = "pg:345"
    test_book_provider, test_book_id = test_book_full_id.split(":")

    _store_book_in_redis(redis_client, autocomplete_db, test_book_id)

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
            
            authors {
                firstName
                lastName
                birthYear
                deathYear
            }
            
        }
    }
    """
    result = api_schema.execute(query, variables={"id": test_book_full_id})

    assert isinstance(result.data, dict)
    assert "book" in result.data
    assert "id" in result.data["book"] and result.data["book"]["id"] == test_book_full_id
    assert "provider" in result.data["book"] and result.data["book"]["provider"] == test_book_provider
    assert "title" in result.data["book"] and result.data["book"]["title"] == "Dracula"
    assert "lang" in result.data["book"] and result.data["book"]["lang"] == "en"
    assert "genres" in result.data["book"] and "Vampires -- Fiction" in result.data["book"]["genres"]

    assert "assets" in result.data["book"] and isinstance(result.data["book"]["assets"], dict)
    assert result.data["book"]["assets"]["epub"] == {"exists": True, "size": 22}
    assert result.data["book"]["assets"]["mobi"] == {"exists": False, "size": 0}

    assert "authors" in result.data["book"] and isinstance(result.data["book"]["authors"], list) and \
           result.data["book"]["authors"]
    assert isinstance(result.data["book"]["authors"][0], dict)
    assert result.data["book"]["authors"][0] == {
        "firstName": "Bram",
        "lastName": "Stoker",
        "birthYear": 1847,
        "deathYear": 1912,
    }


def test_basic_author_retrieval(redis_client: StrictRedis, autocomplete_db: Autocomplete):
    test_author_full_id = "pg:61"
    test_author_provider, test_author_id = test_author_full_id.split(":")
    test_book_full_id = "pg:84"
    test_book_provider, test_book_id = test_book_full_id.split(":")

    _store_book_in_redis(redis_client, autocomplete_db, test_book_id, compute_books_by_author=True)

    query = """
    query authorById($id: ID!) {
        author(id: $id) {
        
            id
            provider
            firstName
            lastName
            birthYear
            deathYear
            
            books {
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
    }
    """
    result = api_schema.execute(query, variables={"id": test_author_full_id})

    assert isinstance(result.data, dict)
    assert "author" in result.data
    assert "id" in result.data["author"] and result.data["author"]["id"] == test_author_full_id
    assert "provider" in result.data["author"] and result.data["author"]["provider"] == test_author_provider
    assert "firstName" in result.data["author"] and result.data["author"]["firstName"] == "Mary Wollstonecraft"
    assert "lastName" in result.data["author"] and result.data["author"]["lastName"] == "Shelley"
    assert "birthYear" in result.data["author"] and result.data["author"]["birthYear"] == 1797
    assert "deathYear" in result.data["author"] and result.data["author"]["deathYear"] == 1851
    assert "books" in result.data["author"] and isinstance(result.data["author"]["books"], list) and \
           result.data["author"]["books"]
    book_genres = result.data["author"]["books"][0].pop("genres")
    book_assets = result.data["author"]["books"][0].pop("assets")
    assert result.data["author"]["books"][0] == {
        "id": "pg:84",
        "provider": "pg",
        "title": "Frankenstein; Or, The Modern Prometheus",
        "lang": "en"
    }
    assert "Monsters -- Fiction" in book_genres
    assert isinstance(book_assets, dict) and book_assets
    assert book_assets["epub"] == {"exists": True, "size": 21}
    assert book_assets["mobi"] == {"exists": True, "size": 42}


def test_recursive_retrieval(redis_client: StrictRedis, autocomplete_db: Autocomplete):
    test_book_full_id = "pg:84"
    test_book_provider, test_book_id = test_book_full_id.split(":")

    _store_book_in_redis(redis_client, autocomplete_db, test_book_id, compute_books_by_author=True)

    query = """
    query bookById($id: ID!) {
        book(id: $id) {
            title
            authors {
                lastName
                books {
                    title
                    authors {
                        firstName
                        books {
                            id
                            # don't try this at home
                        }
                    }
                }
            }
        }
    }
    """
    result = api_schema.execute(query, variables={"id": test_book_full_id})

    assert isinstance(result.data, dict)
    assert "book" in result.data

    assert result.data["book"] == {
        "title": "Frankenstein; Or, The Modern Prometheus",
        "authors": [
            {
                "lastName": "Shelley",
                "books": [
                    {
                        "title": "Frankenstein; Or, The Modern Prometheus",
                        "authors": [
                            {
                                "firstName": "Mary Wollstonecraft",
                                "books": [
                                    {"id": test_book_full_id}
                                ]
                            }
                        ]
                    },
                ],
            }
        ]
    }


def test_books_homepage(redis_client: StrictRedis, autocomplete_db: Autocomplete):
    for book_full_id in ("pg:84", "pg:345"):
        book_provider, book_id = book_full_id.split(":")
        _store_book_in_redis(redis_client, autocomplete_db, book_id)

    mutations.set_homepage_books(LANG_ALL, ["pg:84"])

    query = """
        query homepage {
            homepageBooks {
                title
            }
        }
        """
    result = api_schema.execute(query)

    assert isinstance(result.data, dict)
    assert "homepageBooks" in result.data
    assert isinstance(result.data["homepageBooks"], list)
    assert result.data["homepageBooks"] == [
        {"title": "Frankenstein; Or, The Modern Prometheus"},
    ]


def _store_book_in_redis(
        redis_client: StrictRedis,
        autocomplete_db: Autocomplete,
        pg_book_id: int,
        *,
        compute_books_by_author: bool = False
) -> None:
    rdf_path = Path(
        __file__).parent.parent.parent / "fixtures" / "project_gutenberg_books" / str(
        pg_book_id) / f"pg{pg_book_id}.rdf"
    book_to_parse = get_book_to_parse_data(pg_book_id, rdf_path.resolve())
    book = parse_book(book_to_parse)
    library_import.redis.store_book_in_redis(redis_client, autocomplete_db, book)

    if compute_books_by_author:
        library_import.redis.compute_books_by_author(redis_client)
