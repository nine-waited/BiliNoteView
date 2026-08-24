import request from '@/utils/request'

export interface CloudNoteSummary {
  task_id: string
  title: string
  video_url: string
  bvid: string
  platform: string
  quality: string
  style: string
  model_name: string
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  transcript_source: string
  created_at: string
  updated_at: string
  cover_url: string
}

export interface CloudNoteDetail extends CloudNoteSummary {
  markdown: string
  transcript?: {
    language?: string
    full_text?: string
    segments?: Array<{ start: number; end: number; text: string }>
    raw?: unknown
  }
  audio_meta?: {
    cover_url?: string
    duration?: number
    file_path?: string
    platform?: string
    title?: string
    video_id?: string
    raw_info?: unknown
  }
  provider_id?: string
  format?: string[]
}

export function fetchNoteList() {
  return request.get<CloudNoteSummary[]>('/notes/list')
}

export function fetchNoteDetail(taskId: string) {
  return request.get<CloudNoteDetail>(`/notes/${encodeURIComponent(taskId)}`)
}

export function deleteNote(taskId: string) {
  return request.delete<{ ok: boolean; task_id: string }>(
    `/notes/${encodeURIComponent(taskId)}`
  )
}
