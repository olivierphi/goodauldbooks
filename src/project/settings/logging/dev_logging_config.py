LOGGING = {
    "version": 1,
    "formatters": {
        "default": {"format": "[%(asctime)s] %(levelname)s in %(module)s: %(message)s"}
    },
    "handlers": {
        "wsgi": {
            "class": "logging.StreamHandler",
            "stream": "ext://flask.logging.wsgi_errors_stream",
            "formatter": "default",
        }
    },
    "loggers": {
        "server": {"level": "DEBUG", "handlers": ["wsgi"]},
        "apps.books_sources.project_gutenberg": {
            "level": "DEBUG",
            "handlers": ["wsgi"],
        },
    },
}
