from app.models.question_answer import QuestionAnswer
from fastapi import APIRouter, HTTPException, Depends, File, UploadFile
from sqlalchemy.orm import Session
from datetime import datetime
import uuid
import os
import tempfile
import shutil

from app.dependencies.auth import get_db, get_current_user
from app.models.user import User
from app.models.video import Video
from app.services.whisper_service import transcribe_file

router = APIRouter(prefix="/api/videos", tags=["Videos"])

@router.post("/upload")
async def upload_video(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    allowed_types = {
        "video/mp4",
        "video/webm",
        "video/x-msvideo",
        "video/x-matroska",
        "audio/mpeg",
        "audio/wav",
        "audio/x-wav",
        "audio/mp4"
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}"
        )

    video_id = "V" + str(uuid.uuid4())[:8].upper()
    suffix = os.path.splitext(file.filename)[1]

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        shutil.copyfileobj(file.file, temp_file)
        temp_path = temp_file.name

    try:
        transcript, segments, duration = transcribe_file(temp_path)

    except Exception as e:
        os.unlink(temp_path)
        raise HTTPException(
            status_code=500,
            detail=f"Transcription failed: {str(e)}"
        )

    os.unlink(temp_path)

    video = Video(
        id=video_id,
        video_title=file.filename,
        transcript_text=transcript,
        user_id=current_user.id,
        uploaded_by=current_user.username,
        upload_date=datetime.utcnow(),
        duration=duration
    )

    db.add(video)
    db.commit()
    db.refresh(video)

    return {
        "video_id": video.id,
        "title": video.video_title,
        "transcript": video.transcript_text,
        "segments": segments[:10],
        "message": "Video uploaded and transcribed successfully"
    }

@router.get("")
@router.get("/")
def get_videos(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    videos = db.query(Video).filter(Video.user_id == current_user.id).all()

    return {
        "videos": [
            {
                "video_id": v.id,
                "id": v.id,
                "video_title": v.video_title,
                "title": v.video_title,
                "uploaded_by": v.uploaded_by,
                "upload_date": v.upload_date,
                "duration": v.duration,
                "transcript_text": v.transcript_text
            }
            for v in videos
        ]
    }

@router.get("/{video_id}")
def get_video(
    video_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    video = db.query(Video).filter(
        Video.id == video_id,
        Video.user_id == current_user.id
    ).first()

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    return {
        "video_id": video.id,
        "id": video.id,
        "video_title": video.video_title,
        "title": video.video_title,
        "uploaded_by": video.uploaded_by,
        "upload_date": video.upload_date,
        "duration": video.duration,
        "transcript_text": video.transcript_text
    }

@router.get("/{video_id}/transcript")
def get_transcript(
    video_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    video = db.query(Video).filter(
        Video.id == video_id,
        Video.user_id == current_user.id
    ).first()

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    return {
        "video_id": video.id,
        "transcript": video.transcript_text,
        "segments": []
    }

@router.get("/{video_id}/summary")
def get_summary(

    video_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.services.groq_service import get_groq

    video = db.query(Video).filter(
        Video.id == video_id,
        Video.user_id == current_user.id
    ).first()

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    try:
        client = get_groq()

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "user",
                    "content": f"Summarize this transcript in 5 bullet points:\n\n{video.transcript_text[:3500]}"
                }
            ],
            max_tokens=500,
            temperature=0.3
        )

        return {"summary": response.choices[0].message.content}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.delete("/{video_id}")
def delete_video(
    video_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    video = db.query(Video).filter(
        Video.id == video_id,
        Video.user_id == current_user.id
    ).first()

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    db.query(QuestionAnswer).filter(
        QuestionAnswer.video_id == video_id,
        QuestionAnswer.user_id == current_user.id
    ).delete()

    db.delete(video)
    db.commit()

    return {
        "message": "Video deleted successfully"
    }