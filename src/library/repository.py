import json
import typing as t

from infra import redis_key
from infra.redis import redis_client
from library.domain import Book, Author
from library.utils import get_genres_from_hashes


def get_authors(providers_and_ids_list: t.List[t.Tuple[str, str]]) -> t.List[Author]:
    res = []
    for provider, id in providers_and_ids_list:
        author = get_author(provider, id)
        if author:
            res.append(author)
    return res


def get_author(provider: str, id: str) -> t.Optional[Author]:
    author_redis_key = redis_key.author(provider, id)
    author_raw = redis_client.hgetall(author_redis_key)
    if not author_raw:
        return None
    return _get_author_from_redis_hash(author_raw)


def get_book(provider: str, id: str) -> t.Optional[Book]:
    book_redis_key = redis_key.book(provider, id)
    book_raw = redis_client.hgetall(book_redis_key)
    if not book_raw:
        return None
    return _get_book_from_redis_hash(book_raw)


def get_books_by_genre(
    genre_hash: str, lang: str, start: int, limit: int
) -> t.List[Book]:
    books_for_this_genre_redis_key = redis_key.books_by_genre(genre_hash, lang)
    stop = start + limit - 1
    books_ids = redis_client.zrange(books_for_this_genre_redis_key, start, stop)
    res = []
    for book_id in books_ids:
        provider, id = book_id.split(":")
        book = get_book(provider, id)
        if book:
            res.append(book)
    return res


def get_books_by_author(
    author_provider: str, author_id: str, lang: str, start: int, limit: int
) -> t.List[Book]:
    books_for_this_author_redis_key = redis_key.books_by_author(
        author_provider, author_id, lang
    )
    stop = start + limit - 1
    books_ids = redis_client.zrange(books_for_this_author_redis_key, start, stop)
    res = []
    for book_id in books_ids:
        provider, id = book_id.split(":")
        book = get_book(provider, id)
        if book:
            res.append(book)
    return res


def _get_book_from_redis_hash(book_redis_hash: dict) -> Book:
    authors_providers_and_ids = [
        author_id.split(":") for author_id in json.loads(book_redis_hash["authors_ids"])
    ]
    genres_hashes = json.loads(book_redis_hash["genres"])

    return Book(
        provider=book_redis_hash["provider"],
        id=book_redis_hash["id"],
        title=book_redis_hash["title"],
        lang=book_redis_hash["lang"],
        genres=get_genres_from_hashes(genres_hashes),
        assets=book_redis_hash["assets"],
        authors=get_authors(authors_providers_and_ids),
    )


def _get_author_from_redis_hash(author_redis_hash: dict) -> Author:
    return Author(
        provider=author_redis_hash["provider"],
        id=author_redis_hash["id"],
        name=author_redis_hash["name"],
        first_name=author_redis_hash["first_name"],
        last_name=author_redis_hash["last_name"],
        birth_year=author_redis_hash["birth_year"],
        death_year=author_redis_hash["death_year"],
    )
