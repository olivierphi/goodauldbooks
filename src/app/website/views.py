from django.http import HttpRequest, HttpResponse, JsonResponse
from django.shortcuts import render, get_object_or_404
from django.db import models
from django.core.paginator import Paginator
from django.views.decorators.http import require_http_methods

from app.library import models as library_models

_BOOKS_BY_PAGE_COUNT_DEFAULT = 9


@require_http_methods(["GET"])
def homepage(request: HttpRequest) -> HttpResponse:
    highlighted_books = library_models.Book.objects.filter(
        public_id__in=["pg-345", "pg-84", "pg-5200"]
    ).prefetch_related("authors", "genres")

    view_vars = {"books": highlighted_books}

    return render(request, "website/homepage.html", view_vars)


@require_http_methods(["GET"])
def book(request: HttpRequest, slug: str) -> HttpResponse:
    book = get_object_or_404(_get_books_base_query_set().filter(slug=slug))

    view_vars = {"book": book}

    return render(request, "website/book.html", view_vars)


@require_http_methods(["GET"])
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


@require_http_methods(["GET"])
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


@require_http_methods(["GET"])
def ajax_autocomplete(request: HttpRequest) -> HttpResponse:
    search_str = request.GET["search"]
    lang = request.GET.get("lang", "")

    # We first try to get 4 authors for the given search:
    authors = library_models.Author.objects.all()
    authors = authors.filter(
        models.Q(first_name__istartswith=search_str)
        | models.Q(last_name__istartswith=search_str)
    )
    authors = authors.annotate(nb_books=models.Count("books"))
    authors = authors.order_by("-nb_books", "last_name")
    authors = authors[0:4]
    authors_quick_completion_results = [
        _author_to_quick_autocompletion_result(author) for author in authors
    ]

    # Ok, now we try to complete that results list with 4-8 books, in order to get 8 total results
    nb_books_max = 8 - len(authors_quick_completion_results)
    books = _get_books_base_query_set().prefetch_related("authors")
    if lang:
        books = books.filter(lang=lang)
    # we take all the books that CONTAIN that pattern...
    books = books.filter(title__icontains=search_str)
    # ...but then we look if it STARTS WITH the pattern...
    books = books.annotate(
        starts_with=models.Case(
            models.When(title__istartswith=search_str, then=models.Value(1)),
            default=models.Value(0),
            output_field=models.PositiveSmallIntegerField(),
        )
    )
    # ...and prioritise the books that START with the pattern:
    books = books.order_by("-starts_with", "-highlight", "title")
    books = books[0:nb_books_max]
    books_quick_completion_results = [
        _book_to_quick_autocompletion_result(book) for book in books
    ]

    result = {"data": authors_quick_completion_results + books_quick_completion_results}

    return JsonResponse(result)


def _get_books_base_query_set() -> models.QuerySet:
    return library_models.Book.objects.prefetch_related("authors", "genres")


def _author_to_quick_autocompletion_result(author: library_models.Author) -> dict:
    return dict(
        type="author",
        author_first_name=author.first_name,
        author_last_name=author.last_name,
        author_slug=author.slug,
        author_nb_books=0,  # todo
        highlight=0,  # todo
    )


def _book_to_quick_autocompletion_result(book: library_models.Book) -> dict:
    main_author = book.main_author

    return dict(
        type="book",
        book_title=book.title,
        book_lang=book.lang,
        book_slug=book.slug,
        author_first_name=main_author.first_name if main_author else None,
        author_last_name=main_author.last_name if main_author else None,
        author_slug=main_author.slug if main_author else None,
        author_nb_books=0,  # todo
        highlight=0,  # todo
    )
