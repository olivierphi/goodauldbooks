import functools
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker

DB_PATH = (Path(__file__).parent / ".." / ".." / ".." / ".." / ".." / "db" / "pg_collection.db").resolve()
print(f"{DB_PATH=}")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


@functools.cache
def get_db() -> Session:
    return SessionLocal()
