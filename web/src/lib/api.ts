const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"

interface PrepareVideoResponse {
  video_id: string
  ready: boolean
  message: string
}

interface AskResponse {
  video_id: string
  question: string
  answer: string
}

interface VideoStatusResponse {
  video_id: string
  vectorstore_exists: boolean
  loaded_in_memory: boolean
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = res.statusText
    try {
      const data = await res.json()
      detail = data.detail ?? detail
    } catch {
      // response wasn't JSON — keep statusText
    }
    throw new Error(detail)
  }
  return res.json() as Promise<T>
}

/** Accepts a full YouTube URL (watch/short/embed) or a raw 11-char ID. */
export function extractVideoId(input: string): string {
  const trimmed = input.trim()
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match) return match[1]
  }
  return trimmed
}

export async function prepareVideo(
  videoId: string
): Promise<PrepareVideoResponse> {
  const res = await fetch(`${API_BASE}/videos/prepare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ video_id: videoId }),
  })
  return handle<PrepareVideoResponse>(res)
}

export async function getVideoStatus(
  videoId: string
): Promise<VideoStatusResponse> {
  const res = await fetch(`${API_BASE}/videos/${videoId}/status`)
  return handle<VideoStatusResponse>(res)
}

export async function askQuestion(
  videoId: string,
  question: string
): Promise<AskResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ video_id: videoId, question }),
  })
  return handle<AskResponse>(res)
}
