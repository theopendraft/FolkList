from pydantic import BaseModel
from datetime import date
from typing import Optional

class FestivalCreate(BaseModel):
    event_name: str
    location: str
    accurate_date: date
    time: Optional[str] = None
    type: str
    summary: str
    hook_intro: str

class Festival(BaseModel):
    id: int
    event_name: str
    location: str
    type: str
    summary: str
    hook_intro: str
    accurate_date: Optional[date] = None
    time: Optional[str] = None 

class FestivalUpdate(BaseModel):
    event_name: Optional[str] = None
    location: Optional[str] = None
    accurate_date: Optional[date] = None
    time: Optional[str] = None
    type: Optional[str] = None
    summary: Optional[str] = None
    hook_intro: Optional[str] = None

# Base schema with common fields
class UserEventBase(BaseModel):
    title: str
    date: date

# Schema for creating a new event (inherits from base)
class UserEventCreate(UserEventBase):
    pass

# Schema for reading an event (includes the ID)
class UserEvent(UserEventBase):
    id: int

    class Config:
        orm_mode = True