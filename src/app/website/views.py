from django.http import HttpRequest, HttpResponse
from django.shortcuts import render

from app.library import models as library_models


def homepage(request: HttpRequest) -> HttpResponse:
    highlighted_books = library_models.Book.objects.filter(
        public_id__in=["pg-345", "pg-84"]
    ).prefetch_related("authors", "genres")

    view_vars = {"books": highlighted_books}

    return render(request, "website/homepage.html", view_vars)
