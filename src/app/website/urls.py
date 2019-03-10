from django.urls import path

from . import views

app_name = "library"

urlpatterns = [
    path("", views.homepage, name="home"),
    path("library/book/<slug:slug>", views.book, name="book"),
]
