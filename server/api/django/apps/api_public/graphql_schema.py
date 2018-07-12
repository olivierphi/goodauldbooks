import graphene
from django.conf import settings
from graphene_django.debug import DjangoDebug

import api_public.graphql.library as schema_library


class Query(schema_library.Query, graphene.ObjectType):
    # This class will inherit from multiple Queries
    # as we begin to add more apps to our project
    debug = graphene.Field(DjangoDebug, name='__debug') if settings.DEBUG else None


schema = graphene.Schema(query=Query)
