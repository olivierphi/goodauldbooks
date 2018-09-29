import graphql

from library import models as library_models
from library.repository import author_repository, book_repository


def resolve_book(parent, info: graphql.ResolveInfo, **kwargs) -> library_models.Book:
    book_id = kwargs["book_id"]

    return book_repository.get_book_by_id(book_id, fetch_author=True)


def resolve_author(
    parent, info: graphql.ResolveInfo, **kwargs
) -> library_models.Author:
    author_id = kwargs["author_id"]

    return author_repository.get_author_by_id(author_id, fetch_books=True)
