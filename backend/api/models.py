# backend/api/models.py
from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Festival(Base):
    __tablename__ = "festivals"
    # ... (Festival ke saare columns waise hi rahenge)
    id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String, unique=True, index=True)
    month = Column(String, nullable=True)
    general_date = Column(String, nullable=True)
    location = Column(String)
    type = Column(String)
    summary = Column(String)
    accurate_date = Column(Date, nullable=True)
    hook_intro = Column(String)
    time = Column(String, nullable=True)
    latitude = Column(String, nullable=True)
    longitude = Column(String, nullable=True)
    content_potential = Column(String, nullable=True)
    voiceover_prompt = Column(String, nullable=True)
    ideal_titles = Column(String, nullable=True)

# --- Naya User Model ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    # Yeh User model ko UserEvent se link karega
    events = relationship("UserEvent", back_populates="owner")

class UserEvent(Base):
    __tablename__ = "userevents"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    date = Column(Date)
    # --- Naya Foreign Key ---
    # Yeh column batayega ki event ka owner (user) kaun hai
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="events")