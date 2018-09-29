import graphene
from graphene_django import DjangoObjectType

from library import models as library_models


class Book(DjangoObjectType):
    class Meta:
        model = library_models.Book


class Author(DjangoObjectType):
    class Meta:
        model = library_models.Author


class Genre(DjangoObjectType):
    class Meta:
        model = library_models.Genre


class ItemsListMetadata(graphene.ObjectType):
    total_count = graphene.Int(required=True)
    page = graphene.Int(required=True)
    nb_per_page = graphene.Int(required=True)


class BooksList(graphene.ObjectType):
    books = graphene.List(graphene.NonNull(Book))
    meta = graphene.Field(graphene.NonNull(ItemsListMetadata))
