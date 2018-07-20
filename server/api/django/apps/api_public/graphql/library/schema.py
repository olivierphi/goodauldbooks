import enum
import typing as t

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


class BookId(graphene.ID):
    pass


class AuthorId(graphene.ID):
    pass


class QuickAutocompletionResultType(enum.Enum):
    BOOK = 'book'
    AUTHOR = 'author'


class GenreStatsNbBooksByLang(graphene.ObjectType):
    lang = graphene.String()
    nb_books = graphene.Int()


class GenreWithStats(graphene.ObjectType):
    title = graphene.String()
    nb_books = graphene.Int()
    nb_books_by_lang = graphene.List(GenreStatsNbBooksByLang)


class QuickSearchResultInterface(graphene.Interface):
    type = graphene.Field(graphene.Enum.from_enum(QuickAutocompletionResultType))
    author_id = AuthorId(required=True)
    author_first_name = graphene.String()
    author_last_name = graphene.String()
    author_slug = graphene.String()
    author_nb_books = graphene.Int(required=True)
    highlight = graphene.Int(required=True)


class QuickSearchResultAuthor(graphene.ObjectType):
    class Meta:
        interfaces = (QuickSearchResultInterface,)

    def resolve_type(self, info: graphql.ResolveInfo, **kwargs):
        return QuickAutocompletionResultType.AUTHOR.value


class QuickSearchResultBook(graphene.ObjectType):
    class Meta:
        interfaces = (QuickSearchResultInterface,)

    book_id = BookId(required=True)
    book_title = graphene.String(required=True)
    book_lang = graphene.String(required=True)
    book_slug = graphene.String(required=True)

    def resolve_type(self, info: graphql.ResolveInfo, **kwargs):
        return QuickAutocompletionResultType.BOOK.value


class Book(DjangoObjectType):
    book_id = BookId()
    genres = graphene.List(graphene.String)
    nb_pages = graphene.Int()
    genres_with_stats = graphene.List(GenreWithStats)
    # A bunch of aliases pointing to the inner 'computed_data' fields :-)
    slug = graphene.String()
    has_intro = graphene.Boolean()
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

    def resolve_genres_with_stats(self, info: graphql.ResolveInfo, **kwargs):
        book_genres_with_stats: t.List['GenreWithStats'] = self.get_genres_with_stats()

        graphql_book_genres_with_stats: t.List[GenreWithStats] = [
            _genres_w_stats_to_graphql_equivalent(genre_with_stats)
            for genre_with_stats in book_genres_with_stats
        ]

        return graphql_book_genres_with_stats

    def resolve_slug(self, info: graphql.ResolveInfo, **kwargs):
        return self.computed_data.slug

    def resolve_has_intro(self, info: graphql.ResolveInfo, **kwargs):
        return self.computed_data.has_intro

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


class Author(DjangoObjectType):
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


class ItemsListMetadata(graphene.ObjectType):
    total_count = graphene.Int(required=True)
    total_count_for_all_langs = graphene.Int(required=True)
    page = graphene.Int(required=True)
    nb_per_page = graphene.Int(required=True)


class BooksList(graphene.ObjectType):
    books = graphene.List(graphene.NonNull(Book))
    meta = graphene.Field(graphene.NonNull(ItemsListMetadata))


class AuthorsList(graphene.ObjectType):
    authors = graphene.List(graphene.NonNull(Author))
    meta = graphene.Field(graphene.NonNull(ItemsListMetadata))


def _genres_w_stats_to_graphql_equivalent(genreWithStats: api_models.GenreWithStats) -> GenreWithStats:
    nb_books_by_lang: t.List[GenreStatsNbBooksByLang] = [
        GenreStatsNbBooksByLang(lang=lang, nb_books=nb_books)
        for (lang, nb_books) in genreWithStats.nb_books_by_lang.items()
    ]

    return GenreWithStats(
        title=genreWithStats.title,
        nb_books=genreWithStats.nb_books,
        nb_books_by_lang=nb_books_by_lang
    )
