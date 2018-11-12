import typing as t

from api.graphql import types as gql_types
from library import repository
from library.domain import LANG_ALL
from . import DEFAULT_LIMIT, MAX_LIMIT


def resolve_author_books(
        parent: gql_types.Author, info, **params
) -> t.Iterator[gql_types.Book]:
    if params and "lang" in params:
        lang = params["lang"]
    else:
        lang = LANG_ALL
    page = max(int(params.get("page", 1)), 1)
    nb_per_page = min(int(params.get("nb_per_page", DEFAULT_LIMIT)), MAX_LIMIT)

    offset = (page - 1) * nb_per_page
    domain_books = repository.get_books_by_author(
        parent._author_data.provider, parent._author_data.id, lang, offset, nb_per_page
    )

    return (gql_types.Book(_book_data=book_data) for book_data in domain_books)
