import graphene
from django.conf import settings
from graphene_django.debug import DjangoDebug

import api_public.graphql.library as schema_library


# This class will inherit from multiple Queries
# as we begin to add more apps to our project
class Query(schema_library.Query, graphene.ObjectType):
    debug = graphene.Field(DjangoDebug, name='__debug') if settings.DEBUG else None


schema = graphene.Schema(query=Query)
