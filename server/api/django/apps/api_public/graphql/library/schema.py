import graphene
from graphene_django import DjangoObjectType

import api_public.graphql.library.utils as library_utils
import api_public.models as api_models


class BookId(graphene.String):
    pass


class AuthorId(graphene.String):
    pass


class BookComputedDataType(DjangoObjectType):
    class Meta:
        model = api_models.BookComputedData
        exclude_fields = ('book_id',)


class QuickAutocompletionResultType(graphene.Enum):
    BOOK = 'book'
    AUTHOR = 'author'


class QuickAutocompletionResult(graphene.ObjectType):
    type = QuickAutocompletionResultType(required=True)
    book_id = BookId()
    book_title = graphene.String()
    book_lang = graphene.String()
    book_slug = graphene.String()
    author_id = AuthorId()
    author_first_name = graphene.String()
    author_last_name = graphene.String()
    author_slug = graphene.String()
    author_nb_books = graphene.Int(required=True)
    highlight = graphene.Int(required=True)


class BookType(DjangoObjectType):
    book_id = BookId()
    extra = graphene.Field(BookComputedDataType)  # just an alias to 'computed_data' :-)
    genres = graphene.List(graphene.String)

    def resolve_book_id(self, info, **kwargs):
        return library_utils.get_public_book_id(self)

    def resolve_extra(self, info, **kwargs):
        return self.computed_data

    def resolve_genres(self, info, **kwargs):
        return [genre.title for genre in self.genres.all()]

    class Meta:
        model = api_models.Book
        exclude_fields = ('id', 'computed_data', 'highlight')


class AuthorComputedDataType(DjangoObjectType):
    class Meta:
        model = api_models.AuthorComputedData
        exclude_fields = ('author_id',)


class AuthorType(DjangoObjectType):
    author_id = AuthorId()
    extra = graphene.Field(AuthorComputedDataType)  # just an alias to 'computed_data' :-)

    def resolve_author_id(self, info, **kwargs):
        return library_utils.get_public_author_id(self)

    def resolve_extra(self, info, **kwargs):
        return self.computed_data

    class Meta:
        model = api_models.Author
        exclude_fields = ('id')


class BooksByCriteriaMetadata(graphene.ObjectType):
    nb_results = graphene.Int(required=True)
    nb_results_for_all_langs = graphene.Int(required=True)


class BooksByCriteria(graphene.ObjectType):
    books = graphene.List(graphene.NonNull(BookType))
    meta = graphene.Field(graphene.NonNull(BooksByCriteriaMetadata))


class GenreStatsNbBooksByLang(graphene.ObjectType):
    lang = graphene.String()
    nb_books = graphene.Int()


class GenreStats(graphene.ObjectType):
    title = graphene.String()
    nb_books = graphene.Int()
    nb_books_by_lang = graphene.List(GenreStatsNbBooksByLang)


class BookWithGenresStats(graphene.ObjectType):
    book = graphene.Field(BookType)
    genres_stats = graphene.List(GenreStats)
