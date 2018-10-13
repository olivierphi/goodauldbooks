import django.contrib.postgres.fields as postgres_fields
from django.db import models


class Book(models.Model):
    book_id = models.AutoField(primary_key=True)
    gutenberg_id = models.PositiveIntegerField(null=True)
    title = models.CharField(max_length=500)
    subtitle = models.CharField(max_length=500, null=True)
    lang = models.CharField(max_length=3)
    highlight = models.PositiveIntegerField(default=0)
    size = models.PositiveIntegerField(null=True)
    genres = models.ManyToManyField("Genre", related_name="genres")

    author = models.ForeignKey(
        "Author",
        on_delete=models.DO_NOTHING,
        related_name="books",
        db_column="author_id",
    )


class Author(models.Model):
    author_id = models.AutoField(primary_key=True)
    gutenberg_id = models.PositiveIntegerField(null=True)
    first_name = models.CharField(max_length=255, null=True)
    last_name = models.CharField(max_length=255, null=True)
    birth_year = models.SmallIntegerField(null=True)
    death_year = models.SmallIntegerField(null=True)


class Genre(models.Model):
    genre_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255, null=None)


class BookAdditionalData(models.Model):
    book_id = models.OneToOneField(
        Book, primary_key=True, db_column="book_id", on_delete=models.CASCADE
    )
    intro = models.TextField()

    class Meta:
        db_table = "library_book_additional_data"


class BookAsset(models.Model):
    id = models.AutoField(primary_key=True)
    book_id = models.ForeignKey(Book, db_column="book_id", on_delete=models.CASCADE)
    type = models.CharField(max_length=10)
    path = models.CharField(max_length=255)
    size = models.PositiveIntegerField()

    class Meta:
        db_table = "library_book_asset"

        # We have a unique index on the association of fields "book_id" and "type",
        # but since we can't handle that with the Django ORM we have a manual SQL migration for that...
        # (see "0004_add_unique_index_on_bookasset.py")


##################################################
# "Computed data" and materialized views:
# Here we define models that are projections of the above tables, in order to opimise performance
# (since our library database is mostly "read-only")


class BookComputedData(models.Model):
    book_id = models.OneToOneField(
        Book,
        primary_key=True,
        on_delete=models.DO_NOTHING,
        related_name="computed_data",
        db_column="book_id",
    )
    slug = models.CharField(max_length=50)
    has_intro = models.BooleanField()
    cover_path = models.CharField(max_length=255, null=True)
    epub_path = models.CharField(max_length=255)
    epub_size = models.PositiveIntegerField()
    mobi_path = models.CharField(max_length=255)
    mobi_size = models.PositiveIntegerField()

    class Meta:
        db_table = "library_view_book_computed_data"
        managed = False


class AuthorComputedData(models.Model):
    author_id = models.OneToOneField(
        Author,
        primary_key=True,
        on_delete=models.DO_NOTHING,
        related_name="computed_data",
        db_column="author_id",
    )
    full_name = models.CharField(max_length=200)
    slug = models.CharField(max_length=50)
    nb_books = models.PositiveIntegerField()
    highlight = models.PositiveIntegerField()

    class Meta:
        db_table = "library_view_author_computed_data"
        managed = False


class GenreWithStats(models.Model):
    genre_id = models.OneToOneField(
        Genre,
        primary_key=True,
        on_delete=models.DO_NOTHING,
        related_name="stats",
        db_column="genre_id",
    )
    title = models.CharField(max_length=255, null=None)
    nb_langs = models.PositiveIntegerField(null=None)
    nb_books = models.PositiveIntegerField(null=None)
    nb_books_by_lang = postgres_fields.JSONField(null=None)

    class Meta:
        db_table = "library_view_genre_with_related_data"
        managed = False
