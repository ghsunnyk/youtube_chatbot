import { useEffect, useRef, useState, type FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "@/components/MessageBubble";
import { SendHorizontal } from "lucide-react";
import type { ChatMessage } from "@/types";

interface ChatPanelProps {
  messages: ChatMessage[];
  ready: boolean;
  sending: boolean;
  onAsk: (question: string) => void;
}

export function ChatPanel({ messages, ready, sending, onAsk }: ChatPanelProps) {
  const [question, setQuestion] = useState("");
  const scrollRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = scrollRootRef.current?.querySelector<HTMLDivElement>(
      "[data-radix-scroll-area-viewport]"
    );
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!question.trim() || !ready || sending) return;
    onAsk(question);
    setQuestion("");
  }

  return (
    <Card className="flex h-full min-h-[520px] flex-col ">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Caption Track</CardTitle>
        <span className="font-mono text-[11px] text-muted-foreground">{messages.length} lines</span>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 overflow-hidden pt-0">
        <ScrollArea ref={scrollRootRef} className="flex-1 rounded-sm border border-border bg-black/20 p-4">
          {messages.length === 0 ? (
            <div className="flex h-full min-h-[300px] items-center justify-center text-center">
              <p className="max-w-xs text-sm text-muted-foreground">
                {ready
                  ? "No captions yet. Ask something about the video below to begin."
                  : "Load a video on the left to start a caption track."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((m) => (
                <MessageBubble key={m.id} {...m} />
              ))}
            </div>
          )}
        </ScrollArea>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder={ready ? "Ask something about the video…" : "Load a video first"}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={!ready || sending}
          />
          <Button type="submit" size="icon" disabled={!ready || sending || !question.trim()}>
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}