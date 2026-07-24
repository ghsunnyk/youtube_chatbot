export type VideoStatus = "idle" | "preparing" | "ready" | "error"

export interface ChatMessage {
  id: string
  role: "user" | "bot"
  text: string
  timecode: string
  pending?: boolean
}
