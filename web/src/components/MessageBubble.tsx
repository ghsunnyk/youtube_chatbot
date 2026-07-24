import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

export function MessageBubble({ role, text, timecode, pending }: ChatMessage) {
  const isUser = role === "user";

  return (
    <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
      <span className="font-mono text-[10px] tracking-[0.2em] text-primary/70">
        {timecode} · {isUser ? "YOU" : "BOT"}
      </span>
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-wrap rounded-sm border px-3 py-2 text-sm leading-relaxed",
          isUser
            ? "border-primary/25 bg-primary/10 text-foreground"
            : "border-border bg-black/25 text-foreground"
        )}
      >
        {pending ? (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <span className="animate-blink">▍</span> transcribing answer…
          </span>
        ) : (
          text
        )}
      </div>
    </div>
  );
}