from django.db.models.query import QuerySet

from core import messagebus

from library.domain import GetAuthorByIdQuery
from library.models import Author


@messagebus.register_query_handler(GetAuthorByIdQuery)
def get_author_by_id(query: GetAuthorByIdQuery) -> Author:
    author_qs: QuerySet = Author.objects  # pylint: disable=no-member

    if query.fetch_books:
        author_qs = author_qs.prefetch_related("books")
        if query.fetch_books_genres:
            author_qs = author_qs.prefetch_related("books__genres")

    author = author_qs.get(pk=query.author_id)

    return author
