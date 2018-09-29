from graphene_django import DjangoObjectType

from library import models as library_models


class Book(DjangoObjectType):
    class Meta:
        model = library_models.Book
