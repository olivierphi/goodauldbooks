from pathlib import Path

from ._base import *


LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {"format": "{levelname} {asctime} {module} {message}", "style": "{"},
        "simple": {"format": "{levelname} {message}", "style": "{"},
        "colored": {
            "()": "coloredlogs.ColoredFormatter",
            "format": "{levelname} {module} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "logfile": {
            "level": "DEBUG",
            "class": "logging.handlers.RotatingFileHandler",
            "formatter": "colored",
            "filename": str(Path(BASE_DIR) / ".." / ".." / "log" / "django-debug.log"),
        },
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
            "formatter": "colored",
        },
    },
    "loggers": {
        "django.db.backends": {
            "handlers": ["logfile"],
            "level": "DEBUG",
            "propagate": False,
        },
        "django": {"handlers": ["logfile"], "level": "DEBUG", "propagate": True},
        "library_import": {
            "handlers": ["logfile", "console"],
            "level": "DEBUG",
            "propagate": True,
        },
    },
}
