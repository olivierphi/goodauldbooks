import typing as t

import graphql

from library import models as library_models
from library.repository import author_repository, book_repository


def resolve_book(parent, info: graphql.ResolveInfo, **kwargs) -> library_models.Book:
    book_id = kwargs["book_id"]

    fetch_author = _is_field_requested(info, "author")
    fetch_genres = _is_field_requested(info, "genres")

    return book_repository.get_book_by_id(
        book_id, fetch_author=fetch_author, fetch_genres=fetch_genres
    )


def resolve_author(
    parent, info: graphql.ResolveInfo, **kwargs
) -> library_models.Author:
    author_id = kwargs["author_id"]

    fetch_books = _is_field_requested(info, "books")

    return author_repository.get_author_by_id(author_id, fetch_books=fetch_books)


def _is_field_requested(info: graphql.ResolveInfo, field_name: str) -> bool:
    for ast in info.field_asts:
        for field in ast.selection_set.selections:
            if field.name.value == field_name:
                return True
    return False
