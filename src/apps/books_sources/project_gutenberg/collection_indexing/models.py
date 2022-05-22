from sqlalchemy import JSON, Boolean, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class RawBook(Base):
    __tablename__ = "raw_books"

    pg_id = Column(Integer, primary_key=True)
    rdf_content = Column(String, nullable=False)
    assets_sizes = Column(JSON, nullable=False)
    has_intro = Column(Boolean, nullable=False)
    has_cover = Column(Boolean, nullable=False)
    intro = Column(String)
