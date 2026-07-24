# YouTube Chatbot

Ask questions about a YouTube video's content using its transcript, FAISS,
and a Hugging Face LLM.

## Project structure

```
youtube_chatbot_project/
├── main.py                      # CLI entrypoint
├── app.py                       # FastAPI entrypoint (for the React frontend)
├── youtube_chatbot/
│   ├── __init__.py
│   ├── config.py                 # env vars + shared settings
│   ├── transcript.py             # fetches YouTube transcripts
│   ├── embeddings.py             # shared embedding model (cached)
│   ├── vectorstore.py            # build/load FAISS per video
│   ├── chatbot.py                # LLM chain + YoutubeChatbot class
│   └── api/
│       ├── __init__.py
│       ├── schemas.py            # request/response models
│       ├── cache.py              # in-memory chatbot cache (per video)
│       └── routes.py             # /api/... endpoints
├── vectorstore/                  # saved FAISS indexes (one folder per video)
├── requirements.txt
├── .env.example
└── .gitignore
```

## What changed from the two-script version

Previously you had to:
1. Run `create_memory_for_llm.py` to build the vector store.
2. Run `connect_memory_with_llm.py` to chat with it.

Now `main.py` does both automatically: `YoutubeChatbot` calls
`get_or_create_vectorstore()`, which builds the FAISS index if it doesn't
already exist for that video ID, then loads it either way and starts the
chat loop.

## Setup

```bash
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # then add your Hugging Face token
```

## Usage (CLI)

```bash
python main.py
```

You'll be prompted for a YouTube video ID (the part after `v=` in the URL).
First run for a given video builds and saves its vector store under
`vectorstore/<video_id>/`; later runs reuse it instantly.

## Usage (API, for the React frontend)

```bash
uvicorn app:app --reload
```

The API runs at `http://localhost:8000` (interactive docs at `/docs`).
CORS is already enabled for `http://localhost:3000` (Create React App) and
`http://localhost:5173` (Vite) — add your deployed frontend's URL in
`app.py` when you deploy.

### Endpoints

| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/api/videos/{video_id}/status` | – | Check if a video's vector store exists / is loaded in memory |
| POST | `/api/videos/prepare` | `{ "video_id": "..." }` | Build (or load) the vector store ahead of time |
| POST | `/api/chat` | `{ "video_id": "...", "question": "..." }` | Ask a question about the video |
| DELETE | `/api/videos/{video_id}/cache` | – | Free the in-memory chatbot for a video (files on disk are kept) |

`/api/chat` builds the vector store automatically on first call if you skip
`/api/videos/prepare` — but for a good UX, call `prepare` right after the
user submits a video so the (possibly slow, first-time) build happens
before they start typing questions, and show a loading state until it
resolves.

### Example React usage

```jsx
const API_BASE = "http://localhost:8000/api";

async function prepareVideo(videoId) {
  const res = await fetch(`${API_BASE}/videos/prepare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ video_id: videoId }),
  });
  if (!res.ok) throw new Error((await res.json()).detail);
  return res.json();
}

async function askQuestion(videoId, question) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ video_id: videoId, question }),
  });
  if (!res.ok) throw new Error((await res.json()).detail);
  const data = await res.json();
  return data.answer;
}
```

### Notes for production

- The chatbot cache in `youtube_chatbot/api/cache.py` is in-process memory —
  fine for one uvicorn worker, but won't be shared across multiple workers/
  replicas. For that, swap it for a shared store (e.g. Redis) or just rely
  on `vectorstore_exists()` + reload-per-request.
- First request for a new video can take a while (transcript fetch +
  embedding). Consider calling `/api/videos/prepare` as soon as the user
  submits a video, and polling `/api/videos/{video_id}/status` or just
  showing a spinner until it resolves.
