import os
from dotenv import load_dotenv

load_dotenv()

HF_TOKEN = os.getenv("HUGGINGFACEHUB_ACCESS_TOKEN")

if not HF_TOKEN:
    raise ValueError(
        "HUGGINGFACEHUB_ACCESS_TOKEN is not set. "
        "Copy .env.example to .env and add your token."
    )

EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
LLM_REPO_ID = "meta-llama/Llama-3.1-8B-Instruct"

DB_FAISS_PATH = "vectorstore"
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
RETRIEVER_K = 3
