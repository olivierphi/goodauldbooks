from django.urls import path

from . import views

app_name = "library"

urlpatterns = [
    path("", views.homepage, name="home"),
    path("library/book/<slug:slug>", views.book, name="book"),
    path("library/genre/<slug:slug>", views.books_by_genre, name="books_by_genre"),
    path("library/author/<slug:slug>", views.books_by_author, name="books_by_author"),
    path("library/search", views.ajax_autocomplete),
]
