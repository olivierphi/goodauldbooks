import graphene
from graphene_django import DjangoObjectType

import api_public.graphql.library.utils as library_utils
import api_public.models as api_models


class BookId(graphene.String):
    pass


class AuthorId(graphene.String):
    pass


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
    genres = graphene.List(graphene.String)
    # A bunch of aliases pointing to the inner 'computed_data' fields :-)
    slug = graphene.String()
    cover_path = graphene.String()
    epub_path = graphene.String()
    epub_size = graphene.Int()
    mobi_path = graphene.String()
    mobi_size = graphene.Int()

    def resolve_book_id(self, info, **kwargs):
        return library_utils.get_public_book_id(self)

    def resolve_slug(self, info, **kwargs):
        return self.computed_data.slug

    def resolve_cover_path(self, info, **kwargs):
        return self.computed_data.cover_path

    def resolve_epub_path(self, info, **kwargs):
        return self.computed_data.epub_path

    def resolve_epub_size(self, info, **kwargs):
        return self.computed_data.epub_size

    def resolve_mobi_path(self, info, **kwargs):
        return self.computed_data.mobi_path

    def resolve_mobi_size(self, info, **kwargs):
        return self.computed_data.mobi_size

    def resolve_genres(self, info, **kwargs):
        return [genre.title for genre in self.genres.all()]

    class Meta:
        model = api_models.Book
        exclude_fields = ('gutenberg_id', 'computed_data', 'highlight')


class AuthorType(DjangoObjectType):
    author_id = AuthorId()
    # A bunch of aliases pointing to the inner 'computed_data' fields :-)
    full_name = graphene.String()
    slug = graphene.String()
    nb_books = graphene.Int()
    highlight = graphene.Int()

    def resolve_author_id(self, info, **kwargs):
        return library_utils.get_public_author_id(self)

    def resolve_full_name(self, info, **kwargs):
        return self.computed_data.full_name

    def resolve_slug(self, info, **kwargs):
        return self.computed_data.slug

    def resolve_nb_books(self, info, **kwargs):
        return self.computed_data.nb_books

    def resolve_highlight(self, info, **kwargs):
        return self.computed_data.highlight

    class Meta:
        model = api_models.Author
        exclude_fields = ('gutenberg_id', 'computed_data')


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
