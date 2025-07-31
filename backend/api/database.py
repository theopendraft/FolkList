import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Read the database URL from an environment variable, with a fallback to our old SQLite DB
SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./folk_cal.db")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()