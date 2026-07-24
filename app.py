"""
FastAPI backend for the YouTube Chatbot.

Run with:
    uvicorn app:app --reload

Then the API is available at http://localhost:8000
Interactive docs at http://localhost:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from youtube_chatbot.api.routes import router

app = FastAPI(
    title="YouTube Chatbot API",
    description="Ask questions about a YouTube video using its transcript.",
    version="1.0.0",
)

# Allow the React dev server(s) to call this API. Add your deployed
# frontend's URL here too once you deploy.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Create React App default
        "http://localhost:5173",  # Vite default
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root():
    return {"status": "ok", "message": "YouTube Chatbot API is running."}
