from http import HTTPStatus

from django.http import HttpRequest, HttpResponse


def ping(request: HttpRequest) -> HttpResponse:
    return HttpResponse(status=HTTPStatus.NO_CONTENT)
