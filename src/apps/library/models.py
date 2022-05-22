import zlib

from slugify import slugify
from sqlalchemy import Column, Integer, String, SmallInteger, Table, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

books_and_authors_association_table = Table(
    "books_and_authors",
    Base.metadata,
    Column("book_id", ForeignKey("books.id"), primary_key=True),
    Column("author_id", ForeignKey("authors.id"), primary_key=True),
)

books_and_genres_association_table = Table(
    "books_and_genres",
    Base.metadata,
    Column("book_id", ForeignKey("books.id"), primary_key=True),
    Column("genre_id", ForeignKey("genres.id"), primary_key=True),
)


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, autoincrement=True)
    public_id = Column(String, unique=True, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    subtitle = Column(String)
    lang = Column(String(3), nullable=False)

    authors = relationship("Author", back_populates="books", secondary=books_and_authors_association_table)
    genres = relationship("Genre", secondary=books_and_genres_association_table)


class Author(Base):
    __tablename__ = "authors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    public_id = Column(String, unique=True, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    birth_year = Column(SmallInteger)
    death_year = Column(SmallInteger)

    books = relationship("Book", back_populates="authors", secondary=books_and_authors_association_table)


class Genre(Base):
    __tablename__ = "genres"

    id = Column(Integer, primary_key=True, autoincrement=False)
    name = Column(String, unique=True, nullable=False)
    slug = Column(String, unique=True, nullable=False)

    @classmethod
    def from_name(cls, genre_name: str) -> "Genre":
        id_ = zlib.adler32(genre_name.encode())
        return Genre(id=id_, name=genre_name, slug=slugify(genre_name))
