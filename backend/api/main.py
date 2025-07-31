from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import holidays
from datetime import timedelta
from datetime import date as py_date
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt

from . import models, schemas, date_engine, auth
from .database import engine, SessionLocal

models.Base.metadata.create_all(bind=engine)
app = FastAPI(title="FolkCal API")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"Caught Validation Error: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": f"Invalid input. Error details: {exc.errors()}"},
    )

origins = ["http://localhost:5173", "http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/festivals/{year}", response_model=List[schemas.Festival])
def get_festivals_for_year(year: int, db: Session = Depends(get_db)):
    festivals_from_db = db.query(models.Festival).all()
    year_holidays = holidays.country_holidays('IN', years=year)
    response_festivals = []
    for festival in festivals_from_db:
        festival.accurate_date = date_engine.get_festival_date(festival, year, year_holidays)
        response_festivals.append(festival)
    return response_festivals

# --- THIS IS THE FINAL, CORRECTED VERSION OF THE FUNCTION ---
@app.post("/festivals/", response_model=schemas.Festival)
def create_festival(festival: schemas.FestivalCreate, db: Session = Depends(get_db)):
    existing_festival = db.query(models.Festival).filter(models.Festival.event_name == festival.event_name).first()
    if existing_festival:
        raise HTTPException(status_code=400, detail="A festival with this name already exists.")
    
    # Manually and safely create the database object
    db_festival = models.Festival(
        event_name=festival.event_name,
        location=festival.location,
        type=festival.type,
        summary=festival.summary,
        hook_intro=festival.hook_intro,
        time=festival.time,
        # Derive these fields from the accurate_date
        month=festival.accurate_date.strftime("%b"),
        general_date=festival.accurate_date.strftime("%b %d"),
    )
    db.add(db_festival)
    db.commit()
    db.refresh(db_festival)
    # Add the date back for the response model
    db_festival.accurate_date = festival.accurate_date
    return db_festival

# --- All other endpoints remain the same ---
@app.put("/festivals/{festival_id}", response_model=schemas.Festival)
def update_festival(festival_id: int, festival_update: schemas.FestivalUpdate, db: Session = Depends(get_db)):
    db_festival = db.query(models.Festival).filter(models.Festival.id == festival_id).first()
    if not db_festival:
        raise HTTPException(status_code=404, detail="Festival not found")
    update_data = festival_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        if key == "accurate_date" and value:
            db_festival.month = value.strftime("%b")
            db_festival.general_date = value.strftime("%b %d")
        setattr(db_festival, key, value)
    db.commit()
    db.refresh(db_festival)
    year = py_date.today().year
    year_holidays = holidays.country_holidays('IN', years=year)
    db_festival.accurate_date = db_festival.accurate_date or date_engine.get_festival_date(db_festival, year, year_holidays)
    if festival_update.accurate_date:
         db_festival.accurate_date = festival_update.accurate_date
    return db_festival

@app.delete("/festivals/{festival_id}", response_model=schemas.Festival)
def delete_festival(festival_id: int, db: Session = Depends(get_db)):
    db_festival = db.query(models.Festival).filter(models.Festival.id == festival_id).first()
    if not db_festival:
        raise HTTPException(status_code=404, detail="Festival not found")
    db.delete(db_festival)
    db.commit()
    return db_festival

@app.post("/events/", response_model=schemas.UserEvent)
def create_user_event(event: schemas.UserEventCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    db_event = models.UserEvent(**event.dict(), owner_id=current_user.id)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@app.get("/events/{year}", response_model=List[schemas.UserEvent])
def read_user_events(year: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    start_of_year = py_date(year, 1, 1)
    end_of_year = py_date(year, 12, 31)
    return db.query(models.UserEvent).filter(models.UserEvent.owner_id == current_user.id, models.UserEvent.date.between(start_of_year, end_of_year)).all()

@app.put("/events/{event_id}", response_model=schemas.UserEvent)
def update_user_event(event_id: int, event: schemas.UserEventCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    db_event = db.query(models.UserEvent).filter(models.UserEvent.id == event_id, models.UserEvent.owner_id == current_user.id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    db_event.title = event.title
    db_event.date = event.date
    db.commit()
    db.refresh(db_event)
    return db_event

@app.delete("/events/{event_id}", response_model=schemas.UserEvent)
def delete_user_event(event_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    db_event = db.query(models.UserEvent).filter(models.UserEvent.id == event_id, models.UserEvent.owner_id == current_user.id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(db_event)
    db.commit()
    return db_event