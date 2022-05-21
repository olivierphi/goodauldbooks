from sqlalchemy import JSON, Boolean, Column, Integer, String

from .db import Base


class RawBook(Base):
    __tablename__ = "raw_books"

    pg_id = Column(Integer, primary_key=True)
    rdf_content = Column(String, nullable=False)
    assets_sizes = Column(JSON, nullable=False)
    has_intro = Column(Boolean, nullable=False)
    has_cover = Column(Boolean, nullable=False)
    intro = Column(String)
    # email = Column(String, unique=True, index=True)
    # hashed_password = Column(String)
    # is_active = Column(Boolean, default=True)
    #
    # items = relationship("Item", back_populates="owner")
