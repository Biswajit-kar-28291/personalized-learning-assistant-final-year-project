from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine

from app.models import user, video, question_answer, session

from app.routes import auth_routes
from app.routes import video_routes
from app.routes import qa_routes
from app.routes import stats_routes
from app.routes import health_routes

Base.metadata.create_all(bind=engine)

app = FastAPI(title="LearnAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(video_routes.router)
app.include_router(qa_routes.router)
app.include_router(stats_routes.router)
app.include_router(health_routes.router)