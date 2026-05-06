from sqlalchemy import Column, String, Integer, Text, Float, DateTime
from datetime import datetime
from app.core.database import Base

class QuestionAnswer(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(String)
    user_id = Column(String)
    question = Column(Text)
    answer = Column(Text)
    confidence = Column(Float, default=0.9)
    timestamp = Column(DateTime, default=datetime.utcnow)