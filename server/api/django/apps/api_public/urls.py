from django.conf.urls import url
from django.urls import include
from rest_framework import routers

from . import views

rest_router = routers.DefaultRouter()
rest_router.register(r'authors', views.AuthorViewSet, base_name='author')
rest_router.register(r'books', views.BookViewSet, base_name='book')

urlpatterns = [
    url(r'^', include(rest_router.urls))
]
