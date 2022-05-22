import contextlib
import functools
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.future import Engine
from sqlalchemy.orm import Session

DB_PATH = (Path(__file__).parent / ".." / ".." / ".." / ".." / ".." / "db" / "pg_collection.db").resolve()
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"


@functools.cache
def get_db_engine() -> Engine:
    return create_engine(SQLALCHEMY_DATABASE_URL, future=True, echo=True)


@contextlib.contextmanager
def get_db_session() -> contextlib.AbstractContextManager[Session]:
    with Session(get_db_engine()) as session:
        yield session
