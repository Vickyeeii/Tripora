import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from middleware.db import Base, get_db
from main import app

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture
def db_session():
    """Create test database session"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db_session):
    """Create test client with test database"""
    def override_get_db():
        try:
            yield db_session
        finally:
            db_session.close()
    
    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)


@pytest.fixture
def auth_headers_guide(client, db_session):
    """Create authenticated guide user and return headers"""
    # Register guide
    response = client.post("/auth/register/guide", json={
        "full_name": "Test Guide",
        "email": "guide@test.com",
        "password": "testpass123",
        "phone": "1234567890",
        "address": "Test Address"
    })
    
    # Approve guide (simulate admin approval)
    from auth.models import Guide
    guide = db_session.query(Guide).filter(Guide.email == "guide@test.com").first()
    guide.status = True
    db_session.commit()
    
    # Login
    response = client.post("/auth/login", data={
        "username": "guide@test.com",
        "password": "testpass123"
    })
    token = response.json()["access_token"]
    
    return {"Authorization": f"Bearer {token}"}


# Example tests
def test_create_heritage(client, auth_headers_guide):
    """Test heritage creation by guide"""
    response = client.post("/heritage/", json={
        "name": "Test Temple",
        "description": "A beautiful ancient temple",
        "location_map": "https://maps.google.com/test"
    }, headers=auth_headers_guide)
    
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Temple"
    assert data["is_active"] == False  # Not approved yet


def test_list_heritage_public(client):
    """Test public heritage listing (no auth required)"""
    response = client.get("/heritage/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_unauthorized_create(client):
    """Test heritage creation without authentication"""
    response = client.post("/heritage/", json={
        "name": "Test Temple",
        "description": "A beautiful ancient temple",
        "location_map": "https://maps.google.com/test"
    })
    assert response.status_code == 401
