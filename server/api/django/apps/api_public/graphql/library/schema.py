import graphene
import graphql
from django.core.exceptions import ObjectDoesNotExist
from graphene_django import DjangoObjectType

import api_public.graphql.library.utils as library_utils
import api_public.models as api_models

# This ratio doesn't always work
# (for Dr. Jekyll for example it's closer to 300 ¯\_(ツ)_/¯ ),
# but for most of the cases it roughly does the job
BOOK_SIZE_NB_PAGES_RATIO = 800


class BookId(graphene.String):
    pass


class AuthorId(graphene.String):
    pass


class QuickAutocompletionResultEnumType(graphene.Enum):
    BOOK = 'book'
    AUTHOR = 'author'


class QuickSearchResultType(graphene.ObjectType):
    type = QuickAutocompletionResultEnumType()
    book_id = BookId()
    book_title = graphene.String()
    book_lang = graphene.String()
    book_slug = graphene.String()
    author_id = AuthorId(required=True)
    author_first_name = graphene.String()
    author_last_name = graphene.String()
    author_slug = graphene.String()
    author_nb_books = graphene.Int(required=True)
    highlight = graphene.Int(required=True)

    def resolve_type(self, info: graphql.ResolveInfo, **kwargs):
        return self.type.value


class BookType(DjangoObjectType):
    book_id = BookId()
    genres = graphene.List(graphene.String)
    nb_pages = graphene.Int()
    # A bunch of aliases pointing to the inner 'computed_data' fields :-)
    slug = graphene.String()
    cover_path = graphene.String()
    epub_path = graphene.String()
    epub_size = graphene.Int()
    mobi_path = graphene.String()
    mobi_size = graphene.Int()
    # And this one is a proxy to the inner "additional_data" intro data:
    intro = graphene.String()

    def resolve_book_id(self, info: graphql.ResolveInfo, **kwargs):
        return library_utils.get_public_book_id(self)

    def resolve_genres(self, info: graphql.ResolveInfo, **kwargs):
        return [genre.title for genre in self.genres.all()]

    def resolve_nb_pages(self, info: graphql.ResolveInfo, **kwargs):
        return round(self.size / BOOK_SIZE_NB_PAGES_RATIO)

    def resolve_slug(self, info: graphql.ResolveInfo, **kwargs):
        return self.computed_data.slug

    def resolve_cover_path(self, info: graphql.ResolveInfo, **kwargs):
        return self.computed_data.cover_path

    def resolve_epub_path(self, info: graphql.ResolveInfo, **kwargs):
        return self.computed_data.epub_path

    def resolve_epub_size(self, info: graphql.ResolveInfo, **kwargs):
        return self.computed_data.epub_size

    def resolve_mobi_path(self, info: graphql.ResolveInfo, **kwargs):
        return self.computed_data.mobi_path

    def resolve_mobi_size(self, info: graphql.ResolveInfo, **kwargs):
        return self.computed_data.mobi_size

    def resolve_intro(self, info: graphql.ResolveInfo, **kwargs):
        try:
            return self.additional_data.intro
        except ObjectDoesNotExist:
            return None

    class Meta:
        model = api_models.Book
        exclude_fields = ('gutenberg_id', 'computed_data', 'highlight', 'size')


class AuthorType(DjangoObjectType):
    author_id = AuthorId()
    # A bunch of aliases pointing to the inner 'computed_data' fields :-)
    full_name = graphene.String()
    slug = graphene.String()
    nb_books = graphene.Int()
    highlight = graphene.Int()

    def resolve_author_id(self, info: graphql.ResolveInfo, **kwargs):
        return library_utils.get_public_author_id(self)

    def resolve_full_name(self, info: graphql.ResolveInfo, **kwargs):
        return self.computed_data.full_name

    def resolve_slug(self, info: graphql.ResolveInfo, **kwargs):
        return self.computed_data.slug

    def resolve_nb_books(self, info: graphql.ResolveInfo, **kwargs):
        return self.computed_data.nb_books

    def resolve_highlight(self, info: graphql.ResolveInfo, **kwargs):
        return self.computed_data.highlight

    class Meta:
        model = api_models.Author
        exclude_fields = ('gutenberg_id', 'computed_data', 'highlight')


class BooksByCriteriaMetadataType(graphene.ObjectType):
    total_count = graphene.Int(required=True)
    total_count_for_all_langs = graphene.Int(required=True)
    page = graphene.Int(required=True)
    nb_per_page = graphene.Int(required=True)


class BooksByCriteriaType(graphene.ObjectType):
    books = graphene.List(graphene.NonNull(BookType))
    meta = graphene.Field(graphene.NonNull(BooksByCriteriaMetadataType))


class GenreStatsNbBooksByLangType(graphene.ObjectType):
    lang = graphene.String()
    nb_books = graphene.Int()


class GenreStatsType(graphene.ObjectType):
    title = graphene.String()
    nb_books = graphene.Int()
    nb_books_by_lang = graphene.List(GenreStatsNbBooksByLangType)


class BookWithGenresStatsType(graphene.ObjectType):
    book = graphene.Field(BookType)
    genres_stats = graphene.List(GenreStatsType)
