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
