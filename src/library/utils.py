import typing as t
from zlib import adler32

from hashids import Hashids
from infra.redis import redis_client

_hashids = Hashids()

_genres_hashes_cache = {}


def get_genre_hash(genre: str) -> str:
    global _genres_hashes_cache

    if genre in _genres_hashes_cache:
        return _genres_hashes_cache[genre]

    genre_as_int = adler32(genre.encode())
    genre_hash = _hashids.encode(genre_as_int)

    _genres_hashes_cache[genre] = genre_hash

    return genre_hash


def get_genres_from_hashes(genres_hashes: t.List[str]) -> t.List[str]:
    return [
        g.decode() for g in redis_client.hmget("genres:hashes_mapping", genres_hashes)
    ]
