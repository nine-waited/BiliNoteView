import { useEffect, useRef } from 'react'
import { fetchNoteDetail, fetchNoteList, type CloudNoteDetail } from '@/services/viewNotes'
import { useTaskStore, type Task } from '@/store/taskStore'

function mapDetailToTask(data: CloudNoteDetail): Task {
  const audio = data.audio_meta || {}
  const transcript = data.transcript || {
    full_text: '',
    language: '',
    segments: [],
    raw: null,
  }

  return {
    id: data.task_id,
    markdown: data.markdown || '',
    transcript: {
      full_text: transcript.full_text || '',
      language: transcript.language || '',
      segments: transcript.segments || [],
      raw: transcript.raw ?? null,
    },
    status: 'SUCCESS',
    audioMeta: {
      cover_url: audio.cover_url || data.cover_url || '',
      duration: audio.duration || 0,
      file_path: audio.file_path || '',
      platform: audio.platform || data.platform || 'bilibili',
      raw_info: audio.raw_info ?? null,
      title: audio.title || data.title || data.task_id,
      video_id: audio.video_id || data.bvid || '',
    },
    createdAt: data.created_at || new Date().toISOString(),
    formData: {
      video_url: data.video_url || '',
      link: false,
      screenshot: false,
      platform: data.platform || 'bilibili',
      quality: data.quality || '',
      model_name: data.model_name || '',
      provider_id: data.provider_id || '',
      style: data.style || 'detailed',
      format: data.format || ['summary'],
    },
    tokenUsage: {
      prompt_tokens: data.prompt_tokens || 0,
      completion_tokens: data.completion_tokens || 0,
      total_tokens: data.total_tokens || 0,
      transcript_source: (data.transcript_source as 'subtitle' | 'whisper') || 'subtitle',
    },
  }
}

export function useCloudNotes(intervalMs = 30000) {
  const syncFromCloud = useTaskStore(state => state.syncFromCloud)
  const setCurrentTask = useTaskStore(state => state.setCurrentTask)
  const detailCache = useRef<Map<string, Task>>(new Map())

  const load = async () => {
    try {
      const list = await fetchNoteList()
      const summaries = list || []
      const tasks: Task[] = []

      for (const item of summaries) {
        const cached = detailCache.current.get(item.task_id)
        if (cached) {
          tasks.push(cached)
          continue
        }
        try {
          const detail = await fetchNoteDetail(item.task_id)
          const task = mapDetailToTask(detail)
          detailCache.current.set(item.task_id, task)
          tasks.push(task)
        } catch {
          tasks.push(
            mapDetailToTask({
              ...item,
              markdown: '',
            })
          )
        }
      }

      syncFromCloud(tasks)
      if (!useTaskStore.getState().currentTaskId && tasks.length > 0) {
        setCurrentTask(tasks[0].id)
      }
    } catch {
      // 静默失败，轮询会重试
    }
  }

  useEffect(() => {
    load()
    const timer = setInterval(load, intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])
}
