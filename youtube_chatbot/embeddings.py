from langchain_huggingface import HuggingFaceEmbeddings

from .config import EMBEDDING_MODEL_NAME

_embedding_model = None


def get_embedding_model() -> HuggingFaceEmbeddings:
    """Return a cached embedding model instance (loaded once per process)."""
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)
    return _embedding_model
