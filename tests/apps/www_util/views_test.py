from django.test import Client


def test_ping(client: Client):
    response = client.get("/utils/ping")
    assert response.status_code == 204
    assert response.content == b""
