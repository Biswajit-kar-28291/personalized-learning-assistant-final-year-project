from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.dependencies.auth import get_db, get_current_user
from app.models.user import User
from app.models.video import Video
from app.models.question_answer import QuestionAnswer
from app.schemas.chat import ChatRequest
from app.services.groq_service import get_groq

router = APIRouter(prefix="/api/qa", tags=["Question Answer"])


@router.post("/chat")
def chat(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not req.messages:
        raise HTTPException(status_code=400, detail="Message is required")

    video = db.query(Video).filter(
        Video.id == req.video_id,
        Video.user_id == current_user.id
    ).first()

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    last_question = req.messages[-1].content

    system_prompt = f"""
You are a helpful AI learning assistant.

You have a video transcript, but you can also answer normal learning questions.

VIDEO TITLE:
{video.video_title}

VIDEO TRANSCRIPT:
{video.transcript_text[:3500] if video.transcript_text else "No transcript available"}

Rules:
- If the question is about the video, answer using the transcript.
- If the question is a normal question like math, coding, explanation, or general learning, answer normally.
- If the user asks something about the video and it is not in transcript, say it is not available in the transcript.
- Keep answers simple and clear.
"""

    messages = [{"role": "system", "content": system_prompt}]

    for msg in req.messages:
        messages.append({
            "role": msg.role,
            "content": msg.content
        })

    try:
        client = get_groq()

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            max_tokens=800,
            temperature=0.4
        )

        answer = response.choices[0].message.content

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    qna = QuestionAnswer(
        video_id=req.video_id,
        user_id=current_user.id,
        question=last_question,
        answer=answer,
        confidence=0.9
    )

    db.add(qna)
    db.commit()
    db.refresh(qna)

    return {
        "answer": answer,
        "saved": True,
        "chat_id": qna.id
    }


@router.get("/history/{video_id}")
def qa_history(
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

    history = db.query(QuestionAnswer).filter(
        QuestionAnswer.video_id == video_id,
        QuestionAnswer.user_id == current_user.id
    ).order_by(QuestionAnswer.timestamp.asc()).all()

    return {
        "history": [
            {
                "id": q.id,
                "video_id": q.video_id,
                "question": q.question,
                "answer": q.answer,
                "confidence": q.confidence,
                "timestamp": q.timestamp
            }
            for q in history
        ]
    }


@router.delete("/history/{video_id}")
def clear_qa_history(
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

    deleted_count = db.query(QuestionAnswer).filter(
        QuestionAnswer.video_id == video_id,
        QuestionAnswer.user_id == current_user.id
    ).delete()

    db.commit()

    return {
        "message": "Chat history cleared successfully",
        "deleted_count": deleted_count
    }