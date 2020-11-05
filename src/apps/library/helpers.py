from zlib import adler32


def get_genre_as_int(genre_name: str) -> int:
    return adler32(genre_name.encode())
