from django.conf.urls import url
from django.urls import include
from graphene_django.views import GraphQLView
from rest_framework import routers

from api_public.graphql_schema import schema as api_schema
from . import views

rest_router = routers.DefaultRouter()
rest_router.register(r'authors', views.AuthorViewSet, base_name='author')
rest_router.register(r'books', views.BookViewSet, base_name='book')

urlpatterns = [
    url(r'^graphql', GraphQLView.as_view(graphiql=True, schema=api_schema)),
    url(r'^', include(rest_router.urls))
]
