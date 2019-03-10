from django.http import HttpRequest, HttpResponse
from django.shortcuts import render, get_object_or_404, get_list_or_404
from django.db.models import QuerySet
from django.core.paginator import Paginator

from app.library import models as library_models

_BOOKS_BY_PAGE_COUNT_DEFAULT = 9


def homepage(request: HttpRequest) -> HttpResponse:
    highlighted_books = library_models.Book.objects.filter(
        public_id__in=["pg-345", "pg-84"]
    ).prefetch_related("authors", "genres")

    view_vars = {"books": highlighted_books}

    return render(request, "website/homepage.html", view_vars)


def book(request: HttpRequest, slug: str) -> HttpResponse:
    book = get_object_or_404(_get_books_base_query_set().filter(slug=slug))

    view_vars = {"book": book}

    return render(request, "website/book.html", view_vars)


def books_by_genre(request: HttpRequest, slug: str) -> HttpResponse:
    # simplified version for the moment :-)
    genre = get_object_or_404(library_models.Genre, slug=slug)
    books_list = _get_books_base_query_set().filter(genres__slug=slug).order_by("title")

    paginator = Paginator(books_list, _BOOKS_BY_PAGE_COUNT_DEFAULT)
    view_vars = {
        "genre": genre,
        "books": paginator.get_page(1),
        "books_count": paginator.count,
    }

    return render(request, "website/books_by_genre.html", view_vars)


def books_by_author(request: HttpRequest, slug: str) -> HttpResponse:
    # simplified version for the moment :-)
    author = get_object_or_404(library_models.Author, slug=slug)
    books_list = (
        _get_books_base_query_set().filter(authors__slug=slug).order_by("title")
    )

    paginator = Paginator(books_list, _BOOKS_BY_PAGE_COUNT_DEFAULT)
    view_vars = {
        "author": author,
        "books": paginator.get_page(1),
        "books_count": paginator.count,
    }

    return render(request, "website/books_by_author.html", view_vars)


def _get_books_base_query_set() -> QuerySet:
    return library_models.Book.objects.prefetch_related("authors", "genres")
