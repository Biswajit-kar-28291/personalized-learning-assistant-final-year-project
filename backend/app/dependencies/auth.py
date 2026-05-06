from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.session import SessionTable
from app.models.user import User

security = HTTPBearer(auto_error=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session = db.query(SessionTable).filter(
        SessionTable.token == credentials.credentials
    ).first()

    if not session:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == session.user_id).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user