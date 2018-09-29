import graphql

from library import models as library_models
from library.repository.book import repository as book_repository


def resolve_book(parent, info: graphql.ResolveInfo, **kwargs) -> library_models.Book:
    book_id = kwargs["book_id"]

    return book_repository.get_book_by_id(book_id, fetch_author=True)
