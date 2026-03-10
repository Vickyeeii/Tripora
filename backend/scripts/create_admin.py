import sys
import os
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

import uuid
from sqlalchemy.orm import Session

from middleware.db import SessionLocal
from auth.models import Admin
from middleware.security import hash_password

def create_admin():
    db: Session = SessionLocal()

    # 🔍 Check if admin already exists
    existing_admin = db.query(Admin).filter(
        Admin.email == "admin@tripora.com"
    ).first()

    if existing_admin:
        print("⚠️ Admin already exists")
        db.close()
        return

    admin = Admin(
        id=uuid.uuid4(),
        full_name="Super Admin",
        email="admin@tripora.com",
        password_hash=hash_password("admin123"),
        phone="9999999999"
    )

    db.add(admin)
    db.commit()
    db.close()

    print("✅ Admin created successfully")

if __name__ == "__main__":
    create_admin()

