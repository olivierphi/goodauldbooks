from django.http import HttpRequest, HttpResponse
from django.shortcuts import render, get_object_or_404

from app.library import models as library_models


def homepage(request: HttpRequest) -> HttpResponse:
    highlighted_books = library_models.Book.objects.filter(
        public_id__in=["pg-345", "pg-84"]
    ).prefetch_related("authors", "genres")

    view_vars = {"books": highlighted_books}

    return render(request, "website/homepage.html", view_vars)


def book(request: HttpRequest, slug: str) -> HttpResponse:
    book = get_object_or_404(
        library_models.Book.objects.prefetch_related("authors", "genres"), slug=slug
    )

    view_vars = {"book": book}

    return render(request, "website/book.html", view_vars)
