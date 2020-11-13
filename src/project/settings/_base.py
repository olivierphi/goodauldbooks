# Our base Flask settings, "a la Django"
import os
from pathlib import Path

# import environ # fun fact - Django-environ is not coupled to Django, and works for any Python project :-)

SRC_DIR = (Path(__file__).parent  / ".." / "..").resolve()


SQLALCHEMY_DATABASE_URI = os.environ["DATABASE_URL"]
SQLALCHEMY_TRACK_MODIFICATIONS = False # deprecated setting, we're invited to turn it off
