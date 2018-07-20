import graphene
from django.conf import settings
from graphene_django.debug import DjangoDebug

import api_public.graphql.library.schema as gql_schema
from api_public.graphql.library.query import Query as LibraryQuery


# This class will inherit from multiple Queries
# as we begin to add more apps to our project
class Query(LibraryQuery, graphene.ObjectType):
    debug = graphene.Field(DjangoDebug, name='__debug') if settings.DEBUG else None


schema = graphene.Schema(query=Query,
                         types=[gql_schema.QuickSearchResultBook, gql_schema.QuickSearchResultAuthor], )
