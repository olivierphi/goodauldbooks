import typing as t

from django.conf import settings
import graphql
from graphql.language.ast import Field
from graphene_django.utils import maybe_queryset

from core import messagebus

from public_api.graphql import schema
from library import domain
from library import models as library_models


def resolve_book(parent, info: graphql.ResolveInfo, **kwargs) -> library_models.Book:
    book_id = kwargs["book_id"]

    fetch_author = _is_field_requested_by_graphql_ast(info, "author")
    fetch_genres = _is_field_requested_by_graphql_ast(info, "genres")

    query = domain.GetBookByIdQuery(
        book_id=book_id, fetch_author=fetch_author, fetch_genres=fetch_genres
    )
    result = messagebus.handle_query(query)

    return result


def resolve_author(
    parent, info: graphql.ResolveInfo, **kwargs
) -> library_models.Author:
    author_id = kwargs["author_id"]

    fetch_books = _is_field_requested_by_graphql_ast(info, "books")
    if fetch_books:
        fetch_books_genres = _is_field_requested_by_graphql_ast(info, "books.genres")
    else:
        fetch_books_genres = False

    query = domain.GetAuthorByIdQuery(
        author_id=author_id,
        fetch_books=fetch_books,
        fetch_books_genres=fetch_books_genres,
    )
    result = messagebus.handle_query(query)

    return result


def resolve_books(self, info: graphql.ResolveInfo, **kwargs) -> schema.BooksList:
    genre = kwargs.get("genre", None)
    author_id = kwargs.get("author_id", None)

    page = max(int(kwargs.get("page", 1)), 1)
    nb_per_page = kwargs.get("nb_per_page", domain.DEFAULT_LIMIT)
    pagination = domain.PaginationRequest(page=page, nb_per_page=nb_per_page)

    fetch_author = _is_field_requested_by_graphql_ast(info, "books.author")
    fetch_genres = _is_field_requested_by_graphql_ast(info, "books.genres")

    query = domain.GetBooksQuery(
        author_id=author_id,
        genre=genre,
        pagination=pagination,
        fetch_author=fetch_author,
        fetch_genres=fetch_genres,
    )
    books = messagebus.handle_query(query)
    books = maybe_queryset(books)
    # TODO: metadata.total_count
    metadata = schema.ItemsListMetadata(
        total_count=33, page=page, nb_per_page=nb_per_page
    )

    return schema.BooksList(books=books, meta=metadata)


def _is_field_requested_by_graphql_ast(
    info: graphql.ResolveInfo, field_name: str
) -> bool:
    for field in info.field_asts:
        requested = _is_field_requested(field, field_name)
        if requested:
            return True
    return False


def _is_field_requested(field: Field, field_name: str) -> bool:
    field_name_tree = field_name.split(".")
    current_field_name = field_name_tree.pop(0)
    sub_fields = [f for f in field.selection_set.selections if isinstance(f, Field)]
    for sub_field in sub_fields:
        if sub_field.name.value == current_field_name:
            return (
                True
                if len(field_name_tree) == 0
                else _is_field_requested(sub_field, ".".join(field_name_tree))
            )
    return False


def _resolve_query_set_if_debug(query_set):
    if settings.DEBUG:
        # force the QuerySet underlying data to be fetched, so that we can have the SQL query in the "__debug" fields :-)
        list(query_set)
