"""
Pytest fixtures shared across all test files.

Provides:
- Test database (SQLite in-memory for speed, shared connection via StaticPool)
- Test client (FastAPI TestClient)
- Test user + auth token
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import Base, get_db
from app.models.user import User
from app.core.security import hash_password, create_access_token

# Use in-memory SQLite with StaticPool so all connections share the
# same DB instance (default SQLite :memory: creates a new DB per connection)
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """FastAPI test client with test database override."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session):
    """Create a test user in the database."""
    user = User(
        email="test@finsight.dev",
        password_hash=hash_password("TestPassword123"),
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user):
    """Generate auth cookie header for authenticated requests."""
    token = create_access_token(subject=test_user.id)
    return {"Cookie": f"access_token={token}"}
