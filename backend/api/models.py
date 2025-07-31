# backend/api/models.py
from sqlalchemy import Column, Integer, String, Date

from .database import Base

class Festival(Base):
    __tablename__ = "festivals"

    id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String, unique=True, index=True)
    month = Column(String, nullable=True)
    general_date = Column(String, nullable=True)
    location = Column(String)
    type = Column(String)
    summary = Column(String)
    hook_intro = Column(String)
    time = Column(String, nullable=True)
    latitude = Column(String, nullable=True)
    longitude = Column(String, nullable=True)

    # --- These columns now explicitly allow null values ---
    content_potential = Column(String, nullable=True)
    voiceover_prompt = Column(String, nullable=True)
    ideal_titles = Column(String, nullable=True)

class UserEvent(Base):
    __tablename__ = "userevents"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    date = Column(Date)