from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import uuid
import hashlib
import time

from app.dependencies.auth import get_db, get_current_user
from app.schemas.auth import RegisterRequest, LoginRequest, UpdateUserRequest
from app.models.user import User
from app.models.video import Video
from app.models.question_answer import QuestionAnswer
from app.models.session import SessionTable

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def hash_password(password: str):
    return hashlib.sha256(password.encode()).hexdigest()

def create_token(user_id: str, db: Session):
    token = str(uuid.uuid4())
    db.add(SessionTable(token=token, user_id=user_id, created_at=time.time()))
    db.commit()
    return token

@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    old_user = db.query(User).filter(User.email == req.email).first()

    if old_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        id=str(uuid.uuid4()),
        username=req.username,
        email=req.email,
        password_hash=hash_password(req.password),
        role=req.role
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_token(user.id, db)

    return {
        "message": "Registered successfully",
        "token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()

    if not user or user.password_hash != hash_password(req.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(user.id, db)

    return {
        "token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }

@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role
    }

@router.put("/update")
def update_user(
    req: UpdateUserRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == current_user.id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if req.email and req.email != user.email:
        old_email = db.query(User).filter(User.email == req.email).first()
        if old_email:
            raise HTTPException(status_code=400, detail="Email already used")
        user.email = req.email

    if req.username:
        user.username = req.username

    if req.password:
        user.password_hash = hash_password(req.password)

    db.commit()
    db.refresh(user)

    return {
        "message": "User updated successfully",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }

@router.delete("/delete-account")
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id

    db.query(QuestionAnswer).filter(
        QuestionAnswer.user_id == user_id
    ).delete()

    db.query(Video).filter(
        Video.user_id == user_id
    ).delete()

    db.query(SessionTable).filter(
        SessionTable.user_id == user_id
    ).delete()

    user = db.query(User).filter(User.id == user_id).first()

    if user:
        db.delete(user)

    db.commit()

    return {
        "message": "Account deleted successfully"
    }