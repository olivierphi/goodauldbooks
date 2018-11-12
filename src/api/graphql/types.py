import typing as t
from collections import defaultdict

import graphene
import lazy_import
from library import domain as library_domain


class BookAsset(graphene.ObjectType):
    exists = graphene.Boolean(required=True)
    size = graphene.Int()


class BookAssets(graphene.ObjectType):
    epub = graphene.Field(BookAsset, required=True)
    mobi = graphene.Field(BookAsset, required=True)


class Author(graphene.ObjectType):
    id = graphene.ID()
    provider = graphene.ID()
    first_name = graphene.String()
    last_name = graphene.String()
    birth_year = graphene.Int()
    death_year = graphene.Int()

    books = graphene.List(
        "api.graphql.types.Book",
        resolver=lazy_import.lazy_callable(
            "api.graphql.resolvers.resolve_author_books"
        ),
    )

    _author_data: library_domain.Author = None

    @staticmethod
    def resolve_id(parent: "Author", info) -> str:
        return f"{parent._author_data.provider}:{parent._author_data.id}"

    @staticmethod
    def resolve_provider(parent: "Author", info) -> str:
        return parent._author_data.provider

    @staticmethod
    def resolve_first_name(parent: "Author", info) -> t.Optional[str]:
        return parent._author_data.first_name

    @staticmethod
    def resolve_last_name(parent: "Author", info) -> t.Optional[str]:
        return parent._author_data.last_name

    @staticmethod
    def resolve_birth_year(parent: "Author", info) -> t.Optional[int]:
        return parent._author_data.birth_year

    @staticmethod
    def resolve_death_year(parent: "Author", info) -> t.Optional[int]:
        return parent._author_data.death_year


class Book(graphene.ObjectType):
    id = graphene.ID()
    provider = graphene.ID()
    title = graphene.String()
    lang = graphene.String()
    genres = graphene.List(graphene.String)
    assets = graphene.Field(BookAssets)
    authors = graphene.List(Author)

    _book_data: library_domain.Book = None

    @staticmethod
    def resolve_id(parent: "Book", info) -> str:
        return f"{parent._book_data.provider}:{parent._book_data.id}"

    @staticmethod
    def resolve_provider(parent: "Book", info) -> str:
        return parent._book_data.provider

    @staticmethod
    def resolve_title(parent: "Book", info) -> t.Optional[str]:
        return parent._book_data.title

    @staticmethod
    def resolve_genres(parent: "Book", info) -> str:
        return parent._book_data.genres

    @staticmethod
    def resolve_lang(parent: "Book", info) -> t.Optional[str]:
        return parent._book_data.lang

    @staticmethod
    def resolve_authors(parent: "Book", info) -> t.List[Author]:
        return [Author(_author_data=author) for author in parent._book_data.authors]

    @staticmethod
    def resolve_assets(parent: "Book", info) -> BookAssets:
        assets_raw = parent._book_data.assets

        assets_graphql = defaultdict(lambda: BookAsset(exists=False, size=0))
        for asset in assets_raw:
            assets_graphql[asset.type] = BookAsset(exists=True, size=asset.size)

        return BookAssets(
            epub=assets_graphql[library_domain.BookAssetType.EPUB],
            mobi=assets_graphql[library_domain.BookAssetType.MOBI],
        )
