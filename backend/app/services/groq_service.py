from fastapi import HTTPException
import groq
from app.core.config import GROQ_API_KEY

def get_groq():
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY missing in .env")

    return groq.Groq(api_key=GROQ_API_KEY)