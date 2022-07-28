import os

os.environ["USE_DOT_ENV"] = "YES"

from ._base import *

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "WARNING",
    },
    "loggers": {
        "apps": {
            "handlers": ["console"],
            "level": env.str("APP_LOG_LEVEL", "INFO"),
            "propagate": False,
        },
        "django.db.backends": {
            "handlers": ["console"],
            "level": env.str("SQL_LOG_LEVEL", default="WARNING"),
            "propagate": False,
        },
    },
}

# Setting SQLite journal mode to 'memory' - much faster writes, at the expense of database safety and integrity.
# (gives us 3 times faster writes for the injection of Project Gutenberg transitional DB into the library!)
# @link https://www.sqlite.org/pragma.html#pragma_journal_mode
# @link https://code.djangoproject.com/ticket/24018#comment:4

from django.db.backends.signals import connection_created


def _disable_sqlite_journal(sender, connection, **kwargs):
    import logging

    if connection.vendor == "sqlite":
        logging.getLogger("apps").warning("Setting SQLite journal mode to 'memory'")
        cursor = connection.cursor()
        cursor.execute("PRAGMA journal_mode = memory;")


connection_created.connect(_disable_sqlite_journal)
