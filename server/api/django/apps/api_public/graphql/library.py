import typing as t

import graphene
from graphene_django.types import DjangoObjectType

from api_public.models import Book, Author

# @link http://docs.graphene-python.org/projects/django/en/latest/tutorial-plain/
# @link http://docs.graphene-python.org/projects/django/en/latest/authorization/

DEFAULT_LIMIT = 10
MAX_LIMIT = 15


class BookType(DjangoObjectType):
    class Meta:
        model = Book


class AuthorType(DjangoObjectType):
    class Meta:
        model = Author


class Query():
    all_books = graphene.List(BookType, offset=graphene.Int(), limit=graphene.Int())
    all_authors = graphene.List(AuthorType, offset=graphene.Int(), limit=graphene.Int())
    book = graphene.Field(
        BookType,
        gutenberg_id=graphene.Int(),
        title=graphene.String()
    )
    author = graphene.Field(
        AuthorType,
        gutenberg_id=graphene.Int(),
        first_name=graphene.String(),
        last_name=graphene.String(),
    )

    def resolve_all_books(self, info, **kwargs):
        offset = kwargs.get('offset', 0)
        limit = min(kwargs.get('limit', DEFAULT_LIMIT), MAX_LIMIT)

        return Book.objects.select_related('author').all()[offset:offset + limit]

    def resolve_all_authors(self, info, **kwargs):
        offset = kwargs.get('offset', 0)
        limit = min(kwargs.get('limit', DEFAULT_LIMIT), MAX_LIMIT)

        return Author.objects.prefetch_related('books').all()[offset:offset + limit]

    def resolve_book(self, info, **kwargs):
        gutenberg_id = kwargs.get('gutenberg_id')
        title = kwargs.get('title')

        has_something_to_resolve = any((gutenberg_id, title))

        if not has_something_to_resolve:
            return None

        criteria = dict()
        if gutenberg_id is not None:
            criteria['gutenberg_id'] = gutenberg_id
        if title is not None:
            criteria['title'] = title

        return Book.objects.select_related('author').get(**criteria)

    def resolve_author(self, info, **kwargs) -> t.Optional[Author]:
        gutenberg_id = kwargs.get('gutenberg_id')
        first_name = kwargs.get('first_name')
        last_name = kwargs.get('last_name')

        has_something_to_resolve = any((gutenberg_id, first_name, last_name))

        if not has_something_to_resolve:
            return None

        criteria = dict()
        if gutenberg_id is not None:
            criteria['gutenberg_id'] = gutenberg_id
        if first_name is not None:
            criteria['first_name'] = first_name
        if last_name is not None:
            criteria['last_name'] = last_name

        return Author.objects.prefetch_related('books').get(**criteria)
