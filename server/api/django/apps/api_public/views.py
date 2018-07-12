from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets

from api_public.models import Author, Book
from api_public.serializers import AuthorSerializer, BookSerializer


class BookViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows authors to be viewed.
    """
    queryset = Book.objects.all().order_by('title')
    serializer_class = BookSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_fields = ('title',)


class AuthorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows authors to be viewed.
    """
    queryset = Author.objects.all().order_by('last_name')
    serializer_class = AuthorSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_fields = ('first_name', 'last_name')
