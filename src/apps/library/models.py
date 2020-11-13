import typing as t

from server import db

class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String, unique=True , nullable=False)
    title = db.Column(db.String, nullable=False)
    subtitle = db.Column(db.String)
    lang = db.Column(db.String, nullable=False)
    highlight = db.Column(db.SmallInteger, default=0)
    size = db.Column(db.SmallInteger, nullable=False)
    slug = db.Column(db.String, nullable=False)

class Author(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String, unique=True , nullable=False)
    first_name = db.Column(db.String)
    last_name = db.Column(db.String)

#
# from django.db import models
#
#
# class Book(models.Model):
#     id = models.AutoField(primary_key=True)
#     public_id = models.CharField(max_length=15, unique=True)
#     title = models.CharField(
#         max_length=500
#     )  # yeah, some books from Project Gutenberg have *really* long names :-)
#     subtitle = models.CharField(max_length=500, null=True)
#     lang = models.CharField(max_length=3)
#     highlight = models.PositiveIntegerField(default=0)
#     size = models.PositiveIntegerField(null=True)
#     slug = models.SlugField(max_length=255, unique=True)
#
#     authors = models.ManyToManyField("Author", related_name="books")
#     genres = models.ManyToManyField("Genre", related_name="books")
#
#     @property
#     def main_author(self) -> t.Optional["Author"]:
#         authors = self.authors.all()  # hopefully pre-fetched, if it's a books list :-)
#         return authors[0] if authors else None
#
#     def __str__(self):
#         return f"{self.public_id}: {self.title}"
#
#     class Meta:
#         db_table = "book"
#
#
# class Author(models.Model):
#     id = models.AutoField(primary_key=True)
#     public_id = models.CharField(max_length=15, unique=True)
#     first_name = models.CharField(max_length=255, null=True)
#     last_name = models.CharField(max_length=255, null=True)
#     birth_year = models.SmallIntegerField(null=True)
#     death_year = models.SmallIntegerField(null=True)
#     slug = models.SlugField(max_length=255, unique=True)
#
#     def __str__(self):
#         return f"{self.public_id}: {self.first_name} {self.last_name}"
#
#     class Meta:
#         db_table = "author"
#
#
# class Genre(models.Model):
#     id = models.BigIntegerField(primary_key=True)
#     name = models.CharField(max_length=255)
#     slug = models.SlugField(max_length=255, unique=True)
#
#     def __str__(self):
#         return f"{self.id}: {self.name}"
#
#     class Meta:
#         db_table = "genre"
#
#
# class BookAdditionalData(models.Model):
#     book = models.OneToOneField(
#         Book, on_delete=models.CASCADE, primary_key=True, related_name="additional_data"
#     )
#     intro = models.TextField(null=True)
#
#     class Meta:
#         db_table = "book_additional_data"
