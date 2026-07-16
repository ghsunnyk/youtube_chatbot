# YouTube Chatbot

Ask questions about a YouTube video's content using its transcript, FAISS,
and a Hugging Face LLM.

## Project structure

```
youtube_chatbot_project/
├── main.py                      # single entrypoint - run this
├── youtube_chatbot/
│   ├── __init__.py
│   ├── config.py                 # env vars + shared settings
│   ├── transcript.py             # fetches YouTube transcripts
│   ├── embeddings.py             # shared embedding model (cached)
│   ├── vectorstore.py            # build/load FAISS per video
│   └── chatbot.py                # LLM chain + YoutubeChatbot class
├── vectorstore/                  # saved FAISS indexes (one folder per video)
├── requirements.txt
├── .env.example
└── .gitignore
```

## Setup

```bash
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # then add your Hugging Face token
```

## Usage

```bash
python main.py
```

You'll be prompted for a YouTube video ID (the part after `v=` in the URL).
First run for a given video builds and saves its vector store under
`vectorstore/<video_id>/`; later runs reuse it instantly.
