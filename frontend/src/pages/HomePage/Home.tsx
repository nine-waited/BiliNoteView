import { FC, useEffect, useState } from 'react'
import HomeLayout from '@/layouts/HomeLayout.tsx'
import MarkdownViewer from '@/pages/HomePage/components/MarkdownViewer.tsx'
import { useTaskStore } from '@/store/taskStore'
import History from '@/pages/HomePage/components/History.tsx'

type ViewStatus = 'idle' | 'loading' | 'success' | 'failed'

export const HomePage: FC = () => {
  const tasks = useTaskStore(state => state.tasks)
  const currentTaskId = useTaskStore(state => state.currentTaskId)
  const currentTask = tasks.find(t => t.id === currentTaskId)
  const [status, setStatus] = useState<ViewStatus>('idle')

  useEffect(() => {
    if (!currentTask) {
      setStatus('idle')
    } else if (currentTask.status === 'SUCCESS') {
      setStatus('success')
    } else if (currentTask.status === 'FAILED') {
      setStatus('failed')
    } else {
      setStatus('loading')
    }
  }, [currentTask, currentTask?.status])

  return (
    <HomeLayout
      Preview={<MarkdownViewer status={status} appMode="cloud" />}
      History={<History />}
    />
  )
}
