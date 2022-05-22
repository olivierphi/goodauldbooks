import contextlib
import functools
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.future import Engine
from sqlalchemy.orm import Session, sessionmaker

DB_PATH = (Path(__file__).parent / ".." / ".." / ".." / "db" / "library.db").resolve()
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"


@functools.cache
def get_db_engine() -> Engine:
    return create_engine(SQLALCHEMY_DATABASE_URL, future=True, echo=True)


@contextlib.contextmanager
def get_db_session() -> contextlib.AbstractContextManager[Session]:
    with Session(get_db_engine()) as session:
        yield session


@functools.cache
def get_db_engine_async() -> Engine:
    return create_async_engine(SQLALCHEMY_DATABASE_URL, future=True, echo=True)


@contextlib.asynccontextmanager
async def get_db_session_async() -> contextlib.AbstractAsyncContextManager[Session]:
    async_session = sessionmaker(get_db_engine_async(), expire_on_commit=False, class_=AsyncSession)
    async with async_session() as session:
        yield session
