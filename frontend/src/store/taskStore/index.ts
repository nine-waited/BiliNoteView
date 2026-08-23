import { create } from 'zustand'

export type TaskStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILD'

export interface AudioMeta {
  cover_url: string
  duration: number
  file_path: string
  platform: string
  raw_info: unknown
  title: string
  video_id: string
}

export interface Segment {
  start: number
  end: number
  text: string
}

export interface Transcript {
  full_text: string
  language: string
  raw: unknown
  segments: Segment[]
}

export interface TokenUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  transcript_source: 'subtitle' | 'whisper'
}

export interface Task {
  id: string
  markdown: string
  transcript: Transcript
  status: TaskStatus
  audioMeta: AudioMeta
  createdAt: string
  formData: {
    video_url: string
    link?: boolean
    screenshot?: boolean
    platform: string
    quality: string
    model_name: string
    provider_id: string
    style?: string
    format?: string[]
  }
  tokenUsage?: TokenUsage
}

interface TaskStore {
  tasks: Task[]
  currentTaskId: string | null
  isSubmitting: boolean
  syncFromCloud: (tasks: Task[]) => void
  setCurrentTask: (taskId: string | null) => void
  getCurrentTask: () => Task | null
}

export const useTaskStore = create<TaskStore>()((set, get) => ({
  tasks: [],
  currentTaskId: null,
  isSubmitting: false,

  syncFromCloud: tasks =>
    set(state => {
      const currentStillExists = tasks.some(t => t.id === state.currentTaskId)
      return {
        tasks,
        currentTaskId: currentStillExists ? state.currentTaskId : tasks[0]?.id ?? null,
      }
    }),

  getCurrentTask: () => {
    const currentTaskId = get().currentTaskId
    return get().tasks.find(task => task.id === currentTaskId) || null
  },

  setCurrentTask: taskId => set({ currentTaskId: taskId }),
}))
