import os
from typing import Optional

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS

from .config import DB_FAISS_PATH, CHUNK_SIZE, CHUNK_OVERLAP
from .embeddings import get_embedding_model
from .transcript import get_transcript


def _db_path(video_id: str) -> str:
    return os.path.join(DB_FAISS_PATH, video_id)


def vectorstore_exists(video_id: str) -> bool:
    return os.path.exists(_db_path(video_id))


def build_vectorstore(video_id: str) -> Optional[FAISS]:
    """Fetch the transcript, chunk it, embed it, and save a FAISS vector store."""
    transcript = get_transcript(video_id)
    if not transcript:
        return None

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
    )
    docs = splitter.create_documents([transcript])

    vector_store = FAISS.from_documents(docs, get_embedding_model())
    vector_store.save_local(_db_path(video_id))
    print(f"Vector store created for video '{video_id}'.")
    return vector_store


def load_vectorstore(video_id: str) -> FAISS:
    if not vectorstore_exists(video_id):
        raise ValueError(f"Vector store for video ID '{video_id}' does not exist yet.")
    return FAISS.load_local(
        _db_path(video_id),
        get_embedding_model(),
        allow_dangerous_deserialization=True,
    )


def get_or_create_vectorstore(video_id: str) -> Optional[FAISS]:
    """Load the vector store if it exists, otherwise build it on the fly.

    This is what removes the need to run create_memory_for_llm.py manually
    before connect_memory_with_llm.py - it's now done automatically.
    """
    if vectorstore_exists(video_id):
        print(f"Loading existing vector store for '{video_id}'...")
        return load_vectorstore(video_id)

    print(f"No vector store found for '{video_id}'. Building one now...")
    return build_vectorstore(video_id)
