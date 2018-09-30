# pylint: skip-file
import pytest
from django.test import Client

import _fixtures


@pytest.mark.django_db
def test_get_book_by_id(django_db_setup, client: Client):
    graphql_query = """
query GetBookById($bookId: ID!) {
  book(bookId: $bookId) {
        title
        subtitle
    }
}
"""
    response = client.post(
        "/graphql",
        {"query": graphql_query, "variables": {"bookId": 2}},
        content_type="application/json",
    )
    expected_response = {"data": {"book": {"title": "Dracula", "subtitle": None}}}
    assert response.json() == expected_response


@pytest.mark.django_db
def test_get_book_by_id_with_author(django_db_setup, client: Client):
    graphql_query = """
query GetBookById($bookId: ID!) {
  book(bookId: $bookId) {
        title
        subtitle

        author {
            firstName
            lastName
        }
    }
}
"""
    response = client.post(
        "/graphql",
        {"query": graphql_query, "variables": {"bookId": 1}},
        content_type="application/json",
    )
    expected_response = {
        "data": {
            "book": {
                "title": "Frankenstein",
                "subtitle": "Or, the modern Prometheus",
                "author": {"firstName": "Mary", "lastName": "Shelley"},
            }
        }
    }
    assert response.json() == expected_response
