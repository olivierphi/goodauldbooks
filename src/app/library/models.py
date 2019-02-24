from django.db import models


class Book(models.Model):
    id = models.AutoField(primary_key=True)
    public_id = models.CharField(max_length=15)
    title = models.CharField(
        max_length=500
    )  # yeah, some books from Project Gutenberg have *really* long names :-)
    subtitle = models.CharField(max_length=500, null=True)
    lang = models.CharField(max_length=3)
    highlight = models.PositiveIntegerField(default=0)
    size = models.PositiveIntegerField(null=True)

    authors = models.ManyToManyField("Author", related_name="books")
    genres = models.ManyToManyField("Genre", related_name="books")

    def __str__(self):
        return f"{self.public_id}: {self.title}"

    class Meta:
        db_table = "book"
        indexes = [models.Index(fields=["public_id"])]


class Author(models.Model):
    id = models.AutoField(primary_key=True)
    public_id = models.CharField(max_length=15)
    first_name = models.CharField(max_length=255, null=True)
    last_name = models.CharField(max_length=255, null=True)
    birth_year = models.SmallIntegerField(null=True)
    death_year = models.SmallIntegerField(null=True)

    def __str__(self):
        return f"{self.public_id}: {self.first_name} {self.last_name}"

    class Meta:
        db_table = "author"
        indexes = [models.Index(fields=["public_id"])]


class Genre(models.Model):
    id = models.BigIntegerField(primary_key=True)
    name = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.id}: {self.name}"

    class Meta:
        db_table = "genre"
