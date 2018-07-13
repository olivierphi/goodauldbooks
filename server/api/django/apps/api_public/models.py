from django.db import models


class Book(models.Model):
    book_id = models.PositiveIntegerField(primary_key=True)
    gutenberg_id = models.PositiveIntegerField(null=True)
    title = models.CharField(max_length=255, )
    subtitle = models.CharField(max_length=255, null=True)
    lang = models.CharField(max_length=3)
    highlight = models.PositiveIntegerField(default=0)
    author = models.ForeignKey('Author', on_delete=models.DO_NOTHING, related_name='books', db_column='author_id')
    genres = models.ManyToManyField('Genre', related_name='genres', db_table='library\".\"book_genre')

    class Meta:
        db_table = 'library\".\"book'
        managed = False


class Author(models.Model):
    author_id = models.PositiveIntegerField(primary_key=True)
    gutenberg_id = models.PositiveIntegerField(null=True)
    first_name = models.CharField(max_length=255, null=True)
    last_name = models.CharField(max_length=255, null=True)
    birth_year = models.PositiveSmallIntegerField(null=True)
    death_year = models.PositiveSmallIntegerField(null=True)

    class Meta:
        db_table = 'library\".\"author'
        managed = False


class Genre(models.Model):
    genre_id = models.PositiveIntegerField(primary_key=True)
    title = models.CharField(max_length=255, )

    class Meta:
        db_table = 'library\".\"genre'
        managed = False
