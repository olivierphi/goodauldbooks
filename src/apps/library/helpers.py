from .db import get_db_engine
from .models import Base


def create_schema(*, drop_all_first: bool) -> None:
    engine = get_db_engine()

    if drop_all_first:
        Base.metadata.drop_all(bind=engine)

    Base.metadata.create_all(bind=engine)
