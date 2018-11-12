from collections import defaultdict

import graphene
from library import domain as library_domain


class BookAsset(graphene.ObjectType):
    exists = graphene.Boolean(required=True)
    size = graphene.Int()


class BookAssets(graphene.ObjectType):
    epub = graphene.Field(BookAsset, required=True)
    mobi = graphene.Field(BookAsset, required=True)


class Book(graphene.ObjectType):
    id = graphene.ID()
    provider = graphene.ID()
    title = graphene.String()
    lang = graphene.String()
    genres = graphene.List(graphene.String)
    assets = graphene.Field(BookAssets)

    _book_data: library_domain.Book = None

    @staticmethod
    def resolve_id(parent: "Book", info) -> str:
        return f"{parent._book_data.provider}:{parent._book_data.id}"

    @staticmethod
    def resolve_provider(parent: "Book", info) -> str:
        return parent._book_data.provider

    @staticmethod
    def resolve_title(parent: "Book", info) -> str:
        return parent._book_data.title

    @staticmethod
    def resolve_genres(parent: "Book", info) -> str:
        return parent._book_data.genres

    @staticmethod
    def resolve_lang(parent: "Book", info) -> str:
        return parent._book_data.lang

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
