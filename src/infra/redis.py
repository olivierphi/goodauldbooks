import os

import redis

redis_host = os.getenv("REDIS_HOST", "redis")

redis_client = redis.StrictRedis(host=redis_host)
