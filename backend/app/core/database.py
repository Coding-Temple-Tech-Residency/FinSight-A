from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import get_settings

settings = get_settings()

# SQLite needs a special flag; PostgreSQL doesn't.
# This makes the same code work for both databases.
connect_args = (
    {"check_same_thread": False}
    if settings.database_url.startswith("sqlite")
    else {}
)

# The engine is the actual connection to the database.
engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    echo=False,
)

# SessionLocal is a factory. Each request gets its own session.
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Base is the parent class for all our DB models (User, Portfolio, etc.).
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that opens a DB session for one request,
    then closes it automatically when the request finishes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()