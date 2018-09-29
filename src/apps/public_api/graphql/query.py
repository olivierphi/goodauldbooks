import graphene
import lazy_import

from public_api.graphql import schema


class Query:
    book = graphene.Field(
        schema.Book,
        book_id=graphene.ID(),
        resolver=lazy_import.lazy_callable("public_api.graphql.resolvers.resolve_book"),
    )
