import pytest
from infra.redis import redis_client as redis_base_client, redis_host

from redis import StrictRedis
from walrus import Autocomplete, Database


@pytest.yield_fixture
def redis_client() -> StrictRedis:
    redis_base_client.flushdb()
    yield redis_base_client


@pytest.yield_fixture
def autocomplete_db() -> Autocomplete:
    autocomplete_db = Database(redis_host).autocomplete()
    yield autocomplete_db
