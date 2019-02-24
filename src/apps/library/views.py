from django.http import HttpRequest, HttpResponse


# pylint: disable=unused-argument


def hello_world(request: HttpRequest) -> HttpResponse:
    return HttpResponse("Hello world!")
