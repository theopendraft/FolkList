from sqlalchemy import Column, Integer, String, Date
from .database import Base

class Festival(Base):
    __tablename__ = "festivals"
    id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String, unique=True, index=True)
    month = Column(String)
    general_date = Column(String)
    location = Column(String)
    type = Column(String)
    summary = Column(String)
    content_potential = Column(String)
    hook_intro = Column(String)
    voiceover_prompt = Column(String)
    ideal_titles = Column(String)
    latitude = Column(String, nullable=True) # <-- Add this line
    longitude = Column(String, nullable=True) # <-- Add this line

class UserEvent(Base):
    __tablename__ = "userevents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    date = Column(Date)

