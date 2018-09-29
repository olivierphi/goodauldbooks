import graphene
from django.conf import settings
from graphene_django.debug import DjangoDebug

import public_api.graphql.query

# This class will inherit from multiple Queries
# as we begin to add more apps to our project
class Query(public_api.graphql.query.Query, graphene.ObjectType):
    # @link https://docs.graphene-python.org/projects/django/en/latest/debug/
    debug = graphene.Field(DjangoDebug, name="__debug") if settings.DEBUG else None


schema = graphene.Schema(query=Query)  # pylint: disable=invalid-name
