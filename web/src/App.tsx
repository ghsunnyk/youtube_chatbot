import { useRef, useState } from "react";
import { VideoPanel } from "@/components/VideoPanel";
import { ChatPanel } from "@/components/ChatPanel";
import { extractVideoId, prepareVideo, askQuestion } from "@/lib/api";
import type { ChatMessage, VideoStatus } from "@/types";
import { Button } from "./components/ui/button";
import { useTheme } from "./components/theme-provider";
import { Moon, Sun } from "lucide-react";

function formatTimecode(startMs: number | null): string {
  if (!startMs) return "00:00:00";
  const elapsed = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
  const m = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const s = String(elapsed % 60).padStart(2, "0");
  return `00:${m}:${s}`;
}

export default function App() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [status, setStatus] = useState<VideoStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const sessionStart = useRef<number | null>(null);


  const { theme, setTheme } = useTheme()
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  async function handleLoad(rawInput: string) {
    const id = extractVideoId(rawInput);
    setVideoId(id);
    setStatus("preparing");
    setErrorMessage("");
    setMessages([]);

    try {
      await prepareVideo(id);
      sessionStart.current = Date.now();
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Could not load this video.");
    }
  }

  async function handleAsk(question: string) {
    if (!videoId) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: question,
      timecode: formatTimecode(sessionStart.current),
    };
    const pendingId = crypto.randomUUID();
    const pendingMsg: ChatMessage = {
      id: pendingId,
      role: "bot",
      text: "",
      timecode: formatTimecode(sessionStart.current),
      pending: true,
    };

    setMessages((prev) => [...prev, userMsg, pendingMsg]);
    setSending(true);

    try {
      const res = await askQuestion(videoId, question);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingId
            ? { ...m, text: res.answer, pending: false, timecode: formatTimecode(sessionStart.current) }
            : m
        )
      );
    } catch (err) {
      const detail = err instanceof Error ? err.message : "something went wrong.";
      setMessages((prev) =>
        prev.map((m) => (m.id === pendingId ? { ...m, text: `Error: ${detail}`, pending: false } : m))
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-baseline gap-3">
          <h1 className="font-mono text-lg font-semibold tracking-widest text-primary">▶ YT.CHAT</h1>
          <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
            video transcript assistant
          </span>
        </div>
        <Button
          size='icon'
          variant='secondary'
          onClick={toggleTheme}
          aria-label='Toggle theme'
        >
          {theme === 'dark' ? <Sun /> : <Moon />}
        </Button>
      </header>

      <main className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        <VideoPanel status={status} videoId={videoId} errorMessage={errorMessage} onLoad={handleLoad} />
        <ChatPanel messages={messages} ready={status === "ready"} sending={sending} onAsk={handleAsk} />
      </main>

      <footer className="border-t border-border py-3 text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        transcript index · faiss + huggingface
      </footer>
    </div>
  );
}