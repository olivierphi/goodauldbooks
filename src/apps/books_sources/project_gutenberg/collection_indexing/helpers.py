from .db import Base, engine


def create_schema(*, drop_all_first: bool) -> None:
    if drop_all_first:
        Base.metadata.drop_all(bind=engine)

    Base.metadata.create_all(bind=engine)
