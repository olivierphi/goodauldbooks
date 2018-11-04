def book(provider: str, id: str) -> str:
    return f"book:{provider}:{id}"


def author(provider: str, id: str) -> str:
    return f"author:{provider}:{id}"


def genres_hashes_mapping() -> str:
    return "genres:hashes_mapping"


def genres_hashes_mapping_reversed() -> str:
    return "genres:hashes_mapping:reversed"


def stats_genre_nb_books_by_lang(genre_hash: str) -> str:
    return f"genres:stats:books_by_lang:{genre_hash}"


def books_slugs() -> str:
    return "books_slugs"


def authors_slugs() -> str:
    return "authors_slugs"


def books_by_genre(genre_hash: str, lang: str) -> str:
    return f"library:books_by:genre:{genre_hash}:{lang}"


def books_by_author(author_provider: str, author_id: str, lang: str) -> str:
    return f"library:books_by:author:{author_provider}:{author_id}:{lang}"
