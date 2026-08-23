import { useEffect, useRef } from 'react'
import { useTaskStore } from '@/store/taskStore'
import { get_task_status } from '@/services/note.ts'
import toast from 'react-hot-toast'

export const useTaskPolling = (interval = 3000) => {
  const tasks = useTaskStore(state => state.tasks)
  const updateTaskContent = useTaskStore(state => state.updateTaskContent)

  const tasksRef = useRef(tasks)
  const failureCountsRef = useRef<Record<string, number>>({})

  // 每次 tasks 更新，把最新的 tasks 同步进去
  useEffect(() => {
    tasksRef.current = tasks
  }, [tasks])

  useEffect(() => {
    const timer = setInterval(async () => {
      const pendingTasks = tasksRef.current.filter(
        task => task.status != 'SUCCESS' && task.status != 'FAILED'
      )

      // 无活跃任务时跳过轮询
      if (pendingTasks.length === 0) return

      for (const task of pendingTasks) {
        try {
          const res = await get_task_status(task.id)
          failureCountsRef.current[task.id] = 0
          const { status } = res

          if (status && status !== task.status) {
            if (status === 'SUCCESS') {
              const {
                markdown,
                transcript,
                audio_meta,
                prompt_tokens,
                completion_tokens,
                total_tokens,
                transcript_source,
              } = res.result
              const inferredSource =
                transcript_source ??
                (['ai-zh', 'zh-cn', 'zh-hans'].includes(
                  String(transcript?.language || '').toLowerCase()
                )
                  ? 'subtitle'
                  : transcript
                    ? 'whisper'
                    : undefined)
              toast.success('笔记生成成功')
              updateTaskContent(task.id, {
                status,
                markdown,
                transcript,
                audioMeta: audio_meta,
                prompt_tokens,
                completion_tokens,
                total_tokens,
                transcript_source: inferredSource,
              })
            } else if (status === 'FAILED') {
              updateTaskContent(task.id, { status })
              console.warn(`⚠️ 任务 ${task.id} 失败`)
            } else {
              updateTaskContent(task.id, { status })
            }
          }
        } catch (e) {
          const failures = (failureCountsRef.current[task.id] ?? 0) + 1
          failureCountsRef.current[task.id] = failures
          console.error('❌ 任务轮询失败：', e)
          // 后端短暂不可用时不立刻标失败，避免 Whisper 长跑期间误报
          if (failures >= 5) {
            updateTaskContent(task.id, { status: 'FAILED' })
          }
        }
      }
    }, interval)

    return () => clearInterval(timer)
  }, [interval])
}
