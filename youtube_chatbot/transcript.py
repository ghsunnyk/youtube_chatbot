from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound


def get_transcript(video_id: str) -> str:
    """Fetch and flatten the transcript for a given YouTube video ID.

    Returns an empty string if no transcript is available.
    """
    try:
        api = YouTubeTranscriptApi()
        raw_transcript = api.fetch(video_id, languages=["en"]).to_raw_data()
        return " ".join(chunk["text"] for chunk in raw_transcript)

    except TranscriptsDisabled:
        print("Transcripts are disabled for this video.")
        return ""

    except NoTranscriptFound:
        print("No transcript found for this video.")
        return ""
