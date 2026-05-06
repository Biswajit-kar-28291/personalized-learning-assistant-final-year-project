from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies.auth import get_db, get_current_user
from app.models.user import User
from app.models.video import Video
from app.models.question_answer import QuestionAnswer

router = APIRouter(tags=["Stats"])

@router.get("/api/search")
def search_transcript(
    video_id: str,
    query: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    video = db.query(Video).filter(
        Video.id == video_id,
        Video.user_id == current_user.id
    ).first()

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    transcript = video.transcript_text or ""
    query_lower = query.lower()

    idx = transcript.lower().find(query_lower)

    snippet = ""
    if idx != -1:
        snippet = transcript[max(0, idx - 100):idx + 200]

    return {
        "matches": [],
        "snippet": snippet,
        "total": 1 if idx != -1 else 0
    }

@router.get("/api/stats")
def stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_questions = db.query(QuestionAnswer).filter(
        QuestionAnswer.user_id == current_user.id
    ).count()

    total_videos = db.query(Video).filter(
        Video.user_id == current_user.id
    ).count()

    videos = db.query(Video).filter(Video.user_id == current_user.id).all()

    return {
        "total_questions": total_questions,
        "total_videos": total_videos,
        "videos": [
            {
                "id": video.id,
                "title": video.video_title
            }
            for video in videos
        ]
    }