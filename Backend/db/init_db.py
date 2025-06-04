from sqlalchemy.orm import Session
from Backend.db.session import SessionLocal
from Backend.Models.user import User
from Backend.Models.role import Role
from Backend.Core.security import get_password_hash
from Backend.Core.config import settings

def init_roles():
    db: Session = SessionLocal()
    try:
        for role_name in ["user", "admin"]:
            role = db.query(Role).filter_by(name=role_name).first()
            if not role:
                db.add(Role(name=role_name))
        db.commit()
    finally:
        db.close()

def init_admin():
    db: Session = SessionLocal()
    try:
        username = settings.ADMIN_USERNAME
        email = settings.ADMIN_EMAIL
        password = settings.ADMIN_PASSWORD

        existing_user = db.query(User).filter_by(username=username).first()
        if existing_user:
            return

        hashed_password = get_password_hash(password)

        admin_role = db.query(Role).filter_by(name="admin").first()
        if not admin_role:
            raise Exception("Role 'admin' must exist before creating admin user.")

        new_user = User(
            username=username,
            email=email,
            password_hash=hashed_password,
            roles=[admin_role]
        )

        db.add(new_user)
        db.commit()
    finally:
        db.close()