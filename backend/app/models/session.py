from sqlalchemy import Column, String, Float
from app.core.database import Base

class SessionTable(Base):
    __tablename__ = "sessions"

    token = Column(String, primary_key=True)
    user_id = Column(String)
    created_at = Column(Float)