from rest_framework import serializers

from api_public.models import Author, Book


class BookSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Book
        fields = ('title', 'subtitle', 'author')


class AuthorSerializer(serializers.HyperlinkedModelSerializer):
    books = BookSerializer(many=True, read_only=True)

    class Meta:
        model = Author
        fields = ('first_name', 'last_name', 'books')
