import { useElapsedTimer } from "@/hooks/useElapsedTimer";
import { cn } from "@/lib/utils";

interface RecTickerProps {
  active: boolean;
}

export function RecTicker({ active }: RecTickerProps) {
  const time = useElapsedTimer(active);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-sm border border-border bg-secondary/40 px-3 py-1.5 font-mono text-xs tracking-widest",
        active ? "text-foreground" : "text-muted-foreground"
      )}
    >
      <span className={cn("h-2 w-2 rounded-full bg-accent", active ? "animate-rec-pulse" : "opacity-30")} />
      <span>{active ? "REC" : "STBY"}</span>
      <span className="text-muted-foreground">·</span>
      <span>{time}</span>
    </div>
  );
}