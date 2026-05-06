from pydantic import BaseModel
from typing import Optional

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    role: str = "student"

class LoginRequest(BaseModel):
    email: str
    password: str

class UpdateUserRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None