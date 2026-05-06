from sqlalchemy import Column, String, Text, Float, DateTime
from datetime import datetime
from app.core.database import Base

class Video(Base):
    __tablename__ = "videos"

    id = Column(String, primary_key=True)
    video_title = Column(String)
    transcript_text = Column(Text)
    user_id = Column(String)
    uploaded_by = Column(String)
    upload_date = Column(DateTime, default=datetime.utcnow)
    duration = Column(Float, default=0)