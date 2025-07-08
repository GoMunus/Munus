from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import os

# Sync database setup
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Async database setup
try:
    async_engine = create_async_engine(
        settings.ASYNC_DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        connect_args={"check_same_thread": False} if "sqlite" in settings.ASYNC_DATABASE_URL else {}
    )
except Exception as e:
    print(f"Warning: Could not create async engine: {e}")
    async_engine = None

if async_engine:
    AsyncSessionLocal = async_sessionmaker(
        async_engine, class_=AsyncSession, expire_on_commit=False
    )
else:
    AsyncSessionLocal = None

Base = declarative_base()

# Create tables
def create_tables():
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully")
    except Exception as e:
        print(f"Error creating tables: {e}")

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Async dependency to get DB session
async def get_async_db():
    if AsyncSessionLocal:
        async with AsyncSessionLocal() as session:
            yield session
    else:
        # Fallback to sync session
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()