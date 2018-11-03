import os

import redis

redis_host = os.getenv("REDIS_HOST", "redis")

# We only handle text on this app, so let's use the "decode_responses" flag
# in order to avoid decoding the raw bytes from Redis every time :-)
redis_client = redis.StrictRedis(host=redis_host, decode_responses=True)
