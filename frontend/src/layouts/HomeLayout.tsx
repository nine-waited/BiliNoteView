import React, { FC, useEffect, useRef, useState } from 'react'
import { PanelLeftClose, History as HistoryIcon } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip.tsx'
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area.tsx'
import type { ImperativePanelHandle } from 'react-resizable-panels'
import logo from '@/assets/icon.svg'

interface IProps {
  Preview: React.ReactNode
  History: React.ReactNode
}

const DESKTOP_HISTORY_DEFAULT = 22
const DESKTOP_HISTORY_MAX = 35
const MOBILE_HISTORY_MAX = 25

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767.98px)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767.98px)')
    const onChange = () => setIsMobile(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return isMobile
}

/** 仅保留生成历史 + 主展示区（无左侧生成表单栏） */
const HomeLayout: FC<IProps> = ({ Preview, History }) => {
  const [isMiddleCollapsed, setIsMiddleCollapsed] = useState(false)
  const middlePanelRef = useRef<ImperativePanelHandle>(null)
  const isMobile = useIsMobile()
  const historyMaxSize = isMobile ? MOBILE_HISTORY_MAX : DESKTOP_HISTORY_MAX
  const historyDefaultSize = isMobile ? MOBILE_HISTORY_MAX : DESKTOP_HISTORY_DEFAULT

  const expandHistoryToMax = () => {
    const panel = middlePanelRef.current
    if (!panel) return
    panel.expand(historyMaxSize)
    panel.resize(historyMaxSize)
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-4 max-md:h-11 max-md:py-1.5">
        <div className="hidden h-9 w-9 items-center justify-center overflow-hidden rounded-xl md:flex">
          <img src={logo} alt="logo" className="h-full w-full object-contain" />
        </div>
        <div className="flex items-center gap-2 md:flex-col md:items-start md:gap-0">
          <div className="text-lg font-bold text-gray-800 max-md:text-base">BiliNote 速读</div>
          <div className="text-xs text-neutral-500 max-md:text-[10px]">云端笔记浏览</div>
        </div>
      </header>
      <ResizablePanelGroup direction="horizontal" className="h-full w-full flex-1">
        <ResizablePanel
          ref={middlePanelRef}
          defaultSize={historyDefaultSize}
          minSize={14}
          maxSize={historyMaxSize}
          collapsible
          collapsedSize={0}
          onCollapse={() => setIsMiddleCollapsed(true)}
          onExpand={() => {
            setIsMiddleCollapsed(false)
            if (isMobile) {
              requestAnimationFrame(() => middlePanelRef.current?.resize(MOBILE_HISTORY_MAX))
            }
          }}
        >
          <aside className="flex h-full flex-col overflow-hidden border-r border-neutral-200 bg-white">
            <header className="flex h-10 min-w-0 shrink-0 items-center justify-between gap-1 overflow-hidden border-b border-neutral-100 px-3">
              <span className="min-w-0 flex-1 overflow-hidden whitespace-nowrap text-sm font-medium text-gray-600">
                生成历史
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => middlePanelRef.current?.collapse()}
                      className="text-muted-foreground hover:text-primary shrink-0 cursor-pointer rounded p-1 hover:bg-neutral-100"
                    >
                      <PanelLeftClose className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>收起历史</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </header>
            <ScrollArea className="flex-1 overflow-auto">
              <div>{History}</div>
            </ScrollArea>
          </aside>
        </ResizablePanel>

        <ResizableHandle />

        {isMiddleCollapsed && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={expandHistoryToMax}
                  className="flex h-full w-8 shrink-0 items-center justify-center border-r border-neutral-200 bg-white hover:bg-neutral-50"
                >
                  <HistoryIcon className="h-4 w-4 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <span>展开历史</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <ResizablePanel defaultSize={isMobile ? 75 : 78} minSize={40}>
          <main className="flex h-full min-h-0 flex-col overflow-hidden bg-white p-4 max-md:p-3 lg:p-6">{Preview}</main>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default HomeLayout
