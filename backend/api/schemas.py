# backend/api/schemas.py
from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional, List

# --- Festival Schemas ---
class FestivalCreate(BaseModel):
    event_name: str
    location: str
    accurate_date: date
    time: Optional[str] = None
    type: str
    summary: str
    hook_intro: str

class FestivalUpdate(BaseModel):
    event_name: Optional[str] = None
    location: Optional[str] = None
    accurate_date: Optional[date] = None
    time: Optional[str] = None
    type: Optional[str] = None
    summary: Optional[str] = None
    hook_intro: Optional[str] = None

class Festival(BaseModel):
    id: int
    event_name: str
    location: str
    type: str
    summary: str
    hook_intro: str
    accurate_date: Optional[date] = None
    time: Optional[str] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None

    class Config:
        from_attributes = True

# --- User Event Schemas ---
class UserEventBase(BaseModel):
    title: str
    date: date

class UserEventCreate(UserEventBase):
    pass

class UserEvent(UserEventBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True

# --- User and Authentication Schemas ---
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    events: List[UserEvent] = []

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None