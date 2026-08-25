import { useTaskStore, type Task } from '@/store/taskStore'
import { ScrollArea } from '@/components/ui/scroll-area.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { cn } from '@/lib/utils.ts'
import { Trash } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import PinyinMatch from 'pinyin-match'
import Fuse from 'fuse.js'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import LazyImage from '@/components/LazyImage.tsx'
import { coverOrPlaceholder } from '@/utils/imageUrl'
import { FC, useState, useEffect, useMemo } from 'react'

interface NoteHistoryProps {
  onSelect: (taskId: string) => void
  selectedId: string | null
  hideDelete?: boolean
}

const NoteHistory: FC<NoteHistoryProps> = ({ onSelect, selectedId, hideDelete }) => {
  const tasks = useTaskStore(state => state.tasks)
  const removeTask = useTaskStore(state => state.removeTask)
  const [rawSearch, setRawSearch] = useState('')
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)
  const [deleting, setDeleting] = useState(false)
  const fuse = useMemo(() => new Fuse(tasks, {
    keys: ['audioMeta.title'],
    threshold: 0.4 // 匹配精度（越低越严格）
  }), [tasks])
  useEffect(() => {
    const timer = setTimeout(() => {
      if (rawSearch === '') return
      setSearch(rawSearch)
    }, 300) // 300ms 防抖

    return () => clearTimeout(timer)
  }, [rawSearch])
  const filteredTasks = search.trim()
      ? fuse.search(search).map(result => result.item)
      : tasks

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await removeTask(deleteTarget.id)
      setDeleteTarget(null)
    } catch {
      // toast handled in store
    } finally {
      setDeleting(false)
    }
  }

  if (filteredTasks.length === 0) {
    return (
        <>
          <div className="mb-2">
            <input
                type="text"
                placeholder="搜索笔记标题..."
                className="w-full rounded border border-neutral-300 px-3 py-1 text-sm outline-none focus:border-primary"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="rounded-md border border-neutral-200 bg-neutral-50 py-6 text-center">
            <p className="text-sm text-neutral-500">暂无记录</p>
          </div>
        </>

    )
  }


  return (
    <>
      <Dialog open={!!deleteTarget} onOpenChange={open => !open && !deleting && setDeleteTarget(null)}>
        <DialogContent showCloseButton={!deleting}>
          <DialogHeader>
            <DialogTitle>确认删除笔记？</DialogTitle>
            <DialogDescription>
              将永久删除「{deleteTarget?.audioMeta.title || '未命名笔记'}」，
              并同步移除阿里云服务器上的存储文件，此操作不可恢复。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => setDeleteTarget(null)}
            >
              取消
            </Button>
            <Button type="button" variant="destructive" disabled={deleting} onClick={handleConfirmDelete}>
              {deleting ? '删除中…' : '确认删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mb-2">
        <input
            type="text"
            placeholder="搜索笔记标题..."
            className="w-full rounded border border-neutral-300 px-3 py-1 text-sm outline-none focus:border-primary"
            value={search}
            onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2 overflow-hidden">
        {filteredTasks.map(task => (
          <div
            key={task.id}
            onClick={() => onSelect(task.id)}
            className={cn(
              'flex cursor-pointer flex-col rounded-md border border-neutral-200 p-3 max-md:flex-row max-md:items-center max-md:justify-between max-md:gap-2 max-md:p-2',
              selectedId === task.id && 'border-primary bg-primary-light'
            )}
          >
            <div className="flex min-w-0 items-center gap-4 max-md:gap-2">
              {(task.formData?.platform || task.audioMeta.platform) === 'local' ? (
                <img
                  src={coverOrPlaceholder(task.audioMeta.cover_url)}
                  alt="封面"
                  referrerPolicy="no-referrer"
                  className="h-10 w-12 rounded-md object-cover"
                />
              ) : (
                <LazyImage
                  src={coverOrPlaceholder(task.audioMeta.cover_url)}
                  alt="封面"
                />
              )}

              <div className="hidden min-w-0 w-full items-center justify-between gap-2 md:flex">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="line-clamp-2 max-w-[180px] flex-1 overflow-hidden text-sm text-ellipsis">
                        {task.audioMeta.title || '未命名笔记'}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{task.audioMeta.title || '未命名笔记'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] max-md:mt-0">
              <div className="shrink-0 max-md:hidden">
                {task.status === 'SUCCESS' && (
                  <div className={'bg-primary w-10 rounded p-0.5 text-center text-white'}>
                    已完成
                  </div>
                )}
                {task.status !== 'SUCCESS' && task.status !== 'FAILED' ? (
                  <div className={'w-10 rounded bg-green-500 p-0.5 text-center text-white'}>
                    等待中
                  </div>
                ) : (
                  <></>
                )}
                {task.status === 'FAILED' && (
                  <div className={'w-10 rounded bg-red-500 p-0.5 text-center text-white'}>失败</div>
                )}
              </div>

              <div>
                {!hideDelete && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="small"
                        variant="ghost"
                        onClick={e => {
                          e.stopPropagation()
                          setDeleteTarget(task)
                        }}
                        className="shrink-0"
                      >
                        <Trash className="text-muted-foreground h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>删除</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                )}
              </div>
              {/*<div className="shrink-0">*/}
              {/*  {task.status === 'SUCCESS' && <Badge variant="default">已完成</Badge>}*/}
              {/*  {task.status !== 'SUCCESS' && task.status === 'FAILED' && (*/}
              {/*    <Badge variant="outline">等待中</Badge>*/}
              {/*  )}*/}
              {/*  {task.status === 'FAILED' && <Badge variant="destructive">失败</Badge>}*/}
              {/*</div>*/}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default NoteHistory
