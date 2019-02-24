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

    class Meta:
        db_table = "author"
        indexes = [models.Index(fields=["public_id"])]
