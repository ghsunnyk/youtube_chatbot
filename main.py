"""
YouTube Chatbot - single entrypoint.

Run this one file. It will:
  1. Ask for a YouTube video ID.
  2. Build the vector store for it if one doesn't exist yet
     (this used to require running create_memory_for_llm.py by hand).
  3. Start an interactive Q&A loop against that video's transcript
     (this used to require running connect_memory_with_llm.py by hand).
"""

from youtube_chatbot.chatbot import YoutubeChatbot


def main():
    video_id = input("Enter the YouTube video ID: ").strip()

    try:
        bot = YoutubeChatbot(video_id)
    except ValueError as e:
        print(e)
        return

    print("\nVideo is ready! Ask questions about it (type 'exit' to quit).\n")

    while True:
        question = input("You: ").strip()
        if question.lower() == "exit":
            break
        if not question:
            continue

        answer = bot.ask(question)
        print(f"\nBot: {answer}\n")


if __name__ == "__main__":
    main()
