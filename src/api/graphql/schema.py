import graphene
from library import repository

from . import types


class Query(graphene.ObjectType):
    book = graphene.Field(types.Book, id=graphene.ID(required=True))

    @staticmethod
    def resolve_book(parent, info, **kwargs):
        book_id = kwargs["id"]
        try:
            provider, id = book_id.split(":")
        except ValueError as err:
            raise ValueError("Invalid book id") from err

        book_data = repository.get_book(provider, id)

        return types.Book(_book_data=book_data)


schema = graphene.Schema(query=Query)
