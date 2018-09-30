from django.apps import AppConfig


class LibraryConfig(AppConfig):
    name = "library"

    def ready(self):
        # Register Query Handlers to the Query Bus:
        from library import query_handlers  # pylint: disable=unused-variable
