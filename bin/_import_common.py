from logging.config import dictConfig
from pathlib import Path

root_dir = Path(__file__).parent.parent


def init_import_logging():
    dictConfig(
        {
            "version": 1,
            "handlers": {
                "console": {
                    "class": "logging.FileHandler",
                    "level": "INFO",
                    "filename": str(root_dir / "log" / "library-parsing.log"),
                }
            },
            "loggers": {"library_import": {"level": "DEBUG", "handlers": ["console"]}},
        }
    )
