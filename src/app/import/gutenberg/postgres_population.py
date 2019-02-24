from django.utils.text import slugify

from app.library import (
    models as library_models,
    domain as library_domain,
    helpers as library_helpers,
)


def save_book_in_db(book: library_domain.Book) -> library_models.Book:
    public_id = f"{book.provider}:{book.id}"
    slug = slugify(f"{book.title or ''}-{public_id}")
    book_entity = library_models.Book(
        public_id=public_id, title=book.title, lang=book.lang, slug=slug
    )
    book_entity.save()

    if book.authors:
        for author in book.authors:
            author_entity = save_author_in_db(author)
            book_entity.authors.add(author_entity)

    if book.genres:
        for genre_name in book.genres:
            genre_entity = save_genre_in_db(genre_name)
            book_entity.genres.add(genre_entity)

    return book_entity


def save_author_in_db(author: library_domain.Author) -> library_models.Author:
    public_id = f"{author.provider}:{author.id}"
    author_already_exists = library_models.Author.objects.filter(
        public_id=public_id
    ).exists()

    if author_already_exists:
        return library_models.Author.objects.get(public_id=public_id)

    slug = slugify(f"{author.first_name or ''}-{author.last_name or ''}-{public_id}")
    author_entity = library_models.Author(
        public_id=public_id,
        first_name=author.first_name,
        last_name=author.last_name,
        birth_year=author.birth_year,
        death_year=author.death_year,
        slug=slug,
    )
    author_entity.save()

    return author_entity


def save_genre_in_db(genre_name: str) -> library_models.Genre:
    genre_id = library_helpers.get_genre_as_int(genre_name)
    genre_already_exists = library_models.Genre.objects.filter(id=genre_id).exists()

    if genre_already_exists:
        return library_models.Genre.objects.get(id=genre_id)

    slug = slugify(f"{genre_name or ''}-{genre_id}")
    genre_entity = library_models.Genre(id=genre_id, name=genre_name, slug=slug)
    genre_entity.save()

    return genre_entity
