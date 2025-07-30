from pydantic import BaseModel
from datetime import date
from typing import Optional

class Festival(BaseModel):
    id: int
    event_name: str
    location: str
    type: str
    summary: str
    hook_intro: str
    accurate_date: Optional[date] = None

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