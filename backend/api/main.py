from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import holidays
from datetime import date as py_date

from . import models, schemas, date_engine
from .database import engine, SessionLocal

# This ensures all tables, including the modified 'festivals' table, are created.
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="FolkCal API")

# Middleware to allow your frontend to communicate with the backend
origins = ["http://localhost:5173", "http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get a database session for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Festival Endpoints ---

@app.get("/festivals/{year}", response_model=List[schemas.Festival])
def get_festivals_for_year(year: int, db: Session = Depends(get_db)):
    festivals_from_db = db.query(models.Festival).all()
    year_holidays = holidays.country_holidays('IN', years=year)
    response_festivals = []
    for festival in festivals_from_db:
        # Simulate the accurate_date for the response as it's not a real DB column
        festival.accurate_date = date_engine.get_festival_date(festival, year, year_holidays)
        response_festivals.append(festival)
    return response_festivals

@app.post("/festivals/", response_model=schemas.Festival)
def create_festival(festival: schemas.FestivalCreate, db: Session = Depends(get_db)):
    existing_festival = db.query(models.Festival).filter(models.Festival.event_name == festival.event_name).first()
    if existing_festival:
        raise HTTPException(status_code=400, detail="A festival with this name already exists.")

    db_festival = models.Festival(
        event_name=festival.event_name,
        location=festival.location,
        month=festival.accurate_date.strftime("%b"),
        general_date=festival.accurate_date.strftime("%b %d"),
        time=festival.time,
        type=festival.type,
        summary=festival.summary,
        hook_intro=festival.hook_intro,
    )
    db.add(db_festival)
    db.commit()
    db.refresh(db_festival)
    db_festival.accurate_date = festival.accurate_date
    return db_festival

@app.put("/festivals/{festival_id}", response_model=schemas.Festival)
def update_festival(festival_id: int, festival_update: schemas.FestivalUpdate, db: Session = Depends(get_db)):
    db_festival = db.query(models.Festival).filter(models.Festival.id == festival_id).first()
    if db_festival is None:
        raise HTTPException(status_code=404, detail="Festival not found")

    update_data = festival_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        if key == "accurate_date" and value:
            # If the date is updated, derive the month and general_date as well
            db_festival.month = value.strftime("%b")
            db_festival.general_date = value.strftime("%b %d")
        setattr(db_festival, key, value)

    db.commit()
    db.refresh(db_festival)

    # Re-calculate the accurate_date for the response object
    year = py_date.today().year
    year_holidays = holidays.country_holidays('IN', years=year)
    db_festival.accurate_date = date_engine.get_festival_date(db_festival, year, year_holidays)
    if festival_update.accurate_date: # If a date was provided in the update, use that
         db_festival.accurate_date = festival_update.accurate_date

    return db_festival

@app.delete("/festivals/{festival_id}", response_model=schemas.Festival)
def delete_festival(festival_id: int, db: Session = Depends(get_db)):
    db_festival = db.query(models.Festival).filter(models.Festival.id == festival_id).first()
    if db_festival is None:
        raise HTTPException(status_code=404, detail="Festival not found")
    
    db.delete(db_festival)
    db.commit()
    # The response doesn't need an accurate_date since it's being deleted
    return db_festival

# --- User Event Endpoints ---

@app.post("/events/", response_model=schemas.UserEvent)
def create_user_event(event: schemas.UserEventCreate, db: Session = Depends(get_db)):
    db_event = models.UserEvent(title=event.title, date=event.date)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@app.get("/events/{year}", response_model=List[schemas.UserEvent])
def read_user_events(year: int, db: Session = Depends(get_db)):
    start_of_year = py_date(year, 1, 1)
    end_of_year = py_date(year, 12, 31)
    return db.query(models.UserEvent).filter(models.UserEvent.date.between(start_of_year, end_of_year)).all()

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

@app.delete("/events/{event_id}", response_model=schemas.UserEvent)
def delete_user_event(event_id: int, db: Session = Depends(get_db)):
    db_event = db.query(models.UserEvent).filter(models.UserEvent.id == event_id).first()
    if db_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(db_event)
    db.commit()
    return db_event