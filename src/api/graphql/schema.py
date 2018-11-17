import typing as t

import graphene
import graphql
from library import repository
from library.domain import LANG_ALL
from . import types as gql_types


class Query(graphene.ObjectType):
    homepage_books = graphene.List(gql_types.Book, lang=graphene.String())
    # books = graphene.Field(gql_types.BooksList, page=graphene.Int(), nb_per_page=graphene.Int())
    book = graphene.Field(gql_types.Book, id=graphene.ID(required=True))
    author = graphene.Field(gql_types.Author, id=graphene.ID(required=True))

    @staticmethod
    def resolve_homepage_books(
        parent: None, info: graphql.ResolveInfo, **params
    ) -> t.Iterator[gql_types.Book]:
        lang = params.get("lang", LANG_ALL)
        books = repository.get_books_for_homepage(lang)

        return (gql_types.Book(_book_data=book_data) for book_data in books)

    @staticmethod
    def resolve_book(
        parent: None, info: graphql.ResolveInfo, **params
    ) -> gql_types.Book:
        book_id = params["id"]
        try:
            provider, id = book_id.split(":")
        except ValueError as err:
            raise ValueError("Invalid book id") from err

        book_data = repository.get_book(provider, id)

        return gql_types.Book(_book_data=book_data)

    @staticmethod
    def resolve_author(
        parent: None, info: graphql.ResolveInfo, **params
    ) -> gql_types.Author:
        author_id = params["id"]
        try:
            provider, id = author_id.split(":")
        except ValueError as err:
            raise ValueError("Invalid author id") from err

        author_data = repository.get_author(provider, id)

        return gql_types.Author(_author_data=author_data)


schema = graphene.Schema(query=Query)
