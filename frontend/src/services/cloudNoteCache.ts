import type { Task } from '@/store/taskStore'

const detailCache = new Map<string, Task>()

export function getCachedCloudNote(taskId: string): Task | undefined {
  return detailCache.get(taskId)
}

export function setCachedCloudNote(taskId: string, task: Task): void {
  detailCache.set(taskId, task)
}

export function invalidateCloudNoteCache(taskId: string): void {
  detailCache.delete(taskId)
}
