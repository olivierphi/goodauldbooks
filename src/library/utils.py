import re
import typing as t
from zlib import adler32

from hashids import Hashids
from infra import redis_key
from infra.redis import redis_client
from library.domain import Book, Author
from slugify import slugify

_hashids = Hashids()

_genres_hashes_cache = {}

_BOOK_SLUG_PATTERN = re.compile(r"-(?P<provider>[a-z]{2})-(?P<id>\d+)$")


def get_genre_hash(genre: str) -> str:
    global _genres_hashes_cache

    if genre in _genres_hashes_cache:
        return _genres_hashes_cache[genre]

    genre_as_int = adler32(genre.encode())
    genre_hash = _hashids.encode(genre_as_int)

    _genres_hashes_cache[genre] = genre_hash

    return genre_hash


def get_genres_hashes(genres: t.List[str]) -> t.List[str]:
    return [get_genre_hash(genre) for genre in genres]


def get_genres_from_hashes(genres_hashes: t.List[str]) -> t.List[str]:
    return redis_client.hmget(redis_key.genres_hashes_mapping(), genres_hashes)


def get_provider_and_id_from_book_slug(slug: str) -> t.Tuple[str, str]:
    slug_match = _BOOK_SLUG_PATTERN.search(slug)
    if not slug_match:
        raise Exception(f"Book slug '{slug}' doesn't match the expected pattern")
    return slug_match.group("provider"), slug_match.group("id")


def get_book_slug(book: Book) -> str:
    return f"{slugify(book.title)}-{book.provider}-{book.id}"


def get_author_slug(author: Author) -> str:
    return f"{slugify(author.full_name())}-{author.provider}-{author.id}"
