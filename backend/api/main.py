# backend/api/main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import holidays
from datetime import date as py_date

from . import models, schemas, date_engine
from .database import engine, SessionLocal

# This creates all tables (including the new userevents table)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="FolkCal API")

# CORS Middleware to allow frontend communication
origins = ["http://localhost:5173", "http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Original Festival Endpoint ---
@app.get("/festivals/{year}", response_model=List[schemas.Festival])
def get_festivals_for_year(year: int, db: Session = Depends(get_db)):
    festivals_from_db = db.query(models.Festival).all()
    year_holidays = holidays.country_holidays('IN', years=year)
    response_festivals = []
    for festival in festivals_from_db:
        festival.accurate_date = date_engine.get_festival_date(festival, year, year_holidays)
        response_festivals.append(festival)
    return response_festivals

# --- New Endpoints for Custom User Events ---

# 1. CREATE a new user event
@app.post("/events/", response_model=schemas.UserEvent)
def create_user_event(event: schemas.UserEventCreate, db: Session = Depends(get_db)):
    db_event = models.UserEvent(title=event.title, date=event.date)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

# 2. READ all user events for a specific year
@app.get("/events/{year}", response_model=List[schemas.UserEvent])
def read_user_events(year: int, db: Session = Depends(get_db)):
    start_of_year = py_date(year, 1, 1)
    end_of_year = py_date(year, 12, 31)
    return db.query(models.UserEvent).filter(models.UserEvent.date.between(start_of_year, end_of_year)).all()

# 3. UPDATE an existing user event
@app.put("/events/{event_id}", response_model=schemas.UserEvent)
def update_user_event(event_id: int, event: schemas.UserEventCreate, db: Session = Depends(get_db)):
    db_event = db.query(models.UserEvent).filter(models.UserEvent.id == event_id).first()
    if db_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    db_event.title = event.title
    db_event.date = event.date
    db.commit()
    db.refresh(db_event)
    return db_event

# 4. DELETE a user event
@app.delete("/events/{event_id}", response_model=schemas.UserEvent)
def delete_user_event(event_id: int, db: Session = Depends(get_db)):
    db_event = db.query(models.UserEvent).filter(models.UserEvent.id == event_id).first()
    if db_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(db_event)
    db.commit()
    return db_event