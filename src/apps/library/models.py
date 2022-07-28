from __future__ import annotations

from typing import Callable

from django.db import models
from django.utils.text import slugify


class Book(models.Model):
    public_id = models.CharField(max_length=15, unique=True)
    source = models.CharField(max_length=15)
    # yeah, some books from Project Gutenberg have *really* long names :-)
    title = models.CharField(max_length=500)
    subtitle = models.CharField(max_length=500, null=True)
    lang = models.CharField(max_length=3, null=True)
    size = models.PositiveIntegerField(null=True)
    slug = models.SlugField(max_length=255, unique=True)
    assets = models.JSONField()

    authors = models.ManyToManyField("Author", related_name="books")
    genres = models.ManyToManyField("Genre", related_name="books")

    @property
    def main_author(self) -> Author | None:
        authors = self.authors.all()  # hopefully pre-fetched, if it's a books list :-)
        return authors[0] if authors else None

    def __str__(self):
        return f"{self.public_id}: {self.title}"


class Author(models.Model):
    public_id = models.CharField(max_length=15, unique=True)
    source = models.CharField(max_length=15)
    first_name = models.CharField(max_length=255, null=True)
    last_name = models.CharField(max_length=255, null=True)
    birth_year = models.SmallIntegerField(null=True)
    death_year = models.SmallIntegerField(null=True)
    slug = models.SlugField(max_length=255, unique=True)

    def __str__(self):
        return f"{self.public_id}: {self.first_name} {self.last_name}"


def _genre_name_to_id_default(genre_name: str) -> int:
    import zlib

    return zlib.adler32(genre_name.encode())


class Genre(models.Model):
    # N.B. No auto increment on this one, we'll be in charge of generating the ID from the Genre's name
    id = models.BigIntegerField(primary_key=True, verbose_name="ID")
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)

    id_from_name: Callable[[str], int] = _genre_name_to_id_default
    slug_from_name: Callable[[str], str] = slugify

    @classmethod
    def from_name(cls, genre_name: str) -> Genre:
        id_ = cls.id_from_name(genre_name)
        return Genre(id=id_, name=genre_name, slug=cls.slug_from_name(genre_name))

    def __str__(self):
        return f"{self.id}: {self.name}"


class BookAdditionalData(models.Model):
    book = models.OneToOneField(Book, on_delete=models.CASCADE, primary_key=True, related_name="additional_data")
    intro = models.TextField(null=True)
