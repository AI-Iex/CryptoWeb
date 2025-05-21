from sqlalchemy.orm import Session
from Backend.db.session import SessionLocal
from Backend.Models.role import Role

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
