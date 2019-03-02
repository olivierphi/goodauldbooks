from django.db import models


class Book(models.Model):
    id = models.AutoField(primary_key=True)
    public_id = models.CharField(max_length=15, unique=True)
    title = models.CharField(
        max_length=500
    )  # yeah, some books from Project Gutenberg have *really* long names :-)
    subtitle = models.CharField(max_length=500, null=True)
    lang = models.CharField(max_length=3)
    highlight = models.PositiveIntegerField(default=0)
    size = models.PositiveIntegerField(null=True)
    slug = models.SlugField(max_length=255, unique=True)

    authors = models.ManyToManyField("Author", related_name="books")
    genres = models.ManyToManyField("Genre", related_name="books")

    def __str__(self):
        return f"{self.public_id}: {self.title}"

    class Meta:
        db_table = "book"


class Author(models.Model):
    id = models.AutoField(primary_key=True)
    public_id = models.CharField(max_length=15, unique=True)
    first_name = models.CharField(max_length=255, null=True)
    last_name = models.CharField(max_length=255, null=True)
    birth_year = models.SmallIntegerField(null=True)
    death_year = models.SmallIntegerField(null=True)
    slug = models.SlugField(max_length=255, unique=True)

    def __str__(self):
        return f"{self.public_id}: {self.first_name} {self.last_name}"

    class Meta:
        db_table = "author"


class Genre(models.Model):
    id = models.BigIntegerField(primary_key=True)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)

    def __str__(self):
        return f"{self.id}: {self.name}"

    class Meta:
        db_table = "genre"
