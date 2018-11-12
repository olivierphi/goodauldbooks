import graphene
from library import repository

from . import types as gql_types


class Query(graphene.ObjectType):
    book = graphene.Field(gql_types.Book, id=graphene.ID(required=True))
    author = graphene.Field(gql_types.Author, id=graphene.ID(required=True))

    @staticmethod
    def resolve_book(parent, info, **params) -> gql_types.Book:
        book_id = params["id"]
        try:
            provider, id = book_id.split(":")
        except ValueError as err:
            raise ValueError("Invalid book id") from err

        book_data = repository.get_book(provider, id)

        return gql_types.Book(_book_data=book_data)

    @staticmethod
    def resolve_author(parent, info, **params) -> gql_types.Author:
        author_id = params["id"]
        try:
            provider, id = author_id.split(":")
        except ValueError as err:
            raise ValueError("Invalid author id") from err

        author_data = repository.get_author(provider, id)

        return gql_types.Author(_author_data=author_data)


schema = graphene.Schema(query=Query)
