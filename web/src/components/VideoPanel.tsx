import { useState, type FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VideoStatus } from "@/types";

interface VideoPanelProps {
  status: VideoStatus;
  videoId: string | null;
  errorMessage: string;
  onLoad: (input: string) => void;
}

// Uses the default shadcn Badge "outline" variant everywhere, colored via
// className overrides, so this doesn't depend on any custom badge variants
// beyond what `npx shadcn add badge` gives you out of the box.
const STATUS_CONFIG: Record<VideoStatus, { label: string; className: string }> = {
  idle: { label: "no tape loaded", className: "border-border text-muted-foreground" },
  preparing: { label: "indexing transcript…", className: "border-primary/40 text-primary" },
  ready: { label: "ready", className: "border-emerald-600/40 bg-emerald-600/15 text-emerald-400" },
  error: { label: "load failed", className: "border-destructive/40 bg-destructive/15 text-destructive" },
};

export function VideoPanel({ status, videoId, errorMessage, onLoad }: VideoPanelProps) {
  const [value, setValue] = useState("");
  const config = STATUS_CONFIG[status];
  const isBusy = status === "preparing";

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim() || isBusy) return;
    onLoad(value);
  }

  return (
    <Card className="tape-texture border-2">
      <CardHeader>
        <CardTitle>Source Tape</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <Input
            placeholder="Paste a YouTube URL or video ID"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isBusy}
          />
          <Button type="submit" disabled={isBusy || !value.trim()}>
            {isBusy ? "Indexing…" : "Load video"}
          </Button>
        </form>

        <div className="flex items-center justify-between rounded-sm border border-border bg-secondary/30 px-3 py-2">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            status
          </span>
          <Badge variant="outline" className={config.className}>
            {config.label}
          </Badge>
        </div>

        {videoId && status !== "idle" && (
          <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
            <span>video_id</span>
            <span className={cn("text-foreground", status === "error" && "text-destructive")}>
              {videoId}
            </span>
          </div>
        )}

        {status === "error" && errorMessage && (
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {errorMessage}
          </p>
        )}

        <p className="text-xs leading-relaxed text-muted-foreground">
          Paste any YouTube link (watch, youtu.be, or shorts) or just the 11-character
          video ID. First load builds a transcript index — later loads of the same video
          are instant.
        </p>
      </CardContent>
    </Card>
  );
}