import graphql

from library import models as library_models


def resolve_book(parent, info: graphql.ResolveInfo, **kwargs) -> library_models.Book:
    book_id = kwargs["book_id"]

    return library_models.Book.objects.get(pk=book_id)
