import typing as t

from infra import redis_key
from infra.redis import redis_client


def set_homepage_books(lang: str, books_ids: t.List[str]) -> None:
    redis_client.lpush(redis_key.books_homepage(lang), *books_ids)
