import graphene
import lazy_import

from public_api.graphql import schema


class Query:
    book = graphene.Field(
        schema.Book,
        book_id=graphene.ID(required=True),
        resolver=lazy_import.lazy_callable("public_api.graphql.resolvers.resolve_book"),
    )

    author = graphene.Field(
        schema.Author,
        author_id=graphene.ID(required=True),
        resolver=lazy_import.lazy_callable(
            "public_api.graphql.resolvers.resolve_author"
        ),
    )

    books = graphene.Field(
        schema.BooksList,
        genre=graphene.String(),
        author_id=graphene.ID(),
        page=graphene.Int(),
        nb_per_page=graphene.Int(),
        resolver=lazy_import.lazy_callable(
            "public_api.graphql.resolvers.resolve_books"
        ),
    )
