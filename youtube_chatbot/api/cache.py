import threading
from typing import Dict

from ..chatbot import YoutubeChatbot

_chatbots: Dict[str, YoutubeChatbot] = {}
_locks: Dict[str, threading.Lock] = {}
_locks_guard = threading.Lock()


def _lock_for(video_id: str) -> threading.Lock:
    """Get (or create) a lock scoped to a single video ID."""
    with _locks_guard:
        if video_id not in _locks:
            _locks[video_id] = threading.Lock()
        return _locks[video_id]


def get_chatbot(video_id: str) -> YoutubeChatbot:
    """Return a cached chatbot for this video, building it on first request.

    Only blocks concurrent requests for the *same* video ID while it's
    being built; requests for other videos proceed unaffected.
    """
    if video_id in _chatbots:
        return _chatbots[video_id]

    with _lock_for(video_id):
        if video_id not in _chatbots:
            _chatbots[video_id] = YoutubeChatbot(video_id)
        return _chatbots[video_id]


def is_cached(video_id: str) -> bool:
    return video_id in _chatbots


def clear_cache(video_id: str | None = None) -> None:
    """Drop cached chatbot(s) from memory (does not delete the FAISS files on disk)."""
    if video_id is None:
        _chatbots.clear()
    else:
        _chatbots.pop(video_id, None)
