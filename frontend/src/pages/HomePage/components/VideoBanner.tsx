import { ExternalLink } from 'lucide-react'
import type { AudioMeta } from '@/store/taskStore'
import { coverOrPlaceholder } from '@/utils/imageUrl'

interface VideoBannerProps {
  audioMeta?: AudioMeta
  videoUrl?: string
}

/** 平台 label 映射 */
const platformLabel: Record<string, string> = {
  bilibili: '哔哩哔哩',
  youtube: 'YouTube',
  douyin: '抖音',
  xiaohongshu: '小红书',
}

export default function VideoBanner({ audioMeta, videoUrl }: VideoBannerProps) {
  if (!audioMeta) return null

  const coverUrl = coverOrPlaceholder(audioMeta.cover_url)
  const title = audioMeta.title
  const rawInfo = (audioMeta.raw_info || {}) as { uploader?: string; webpage_url?: string }
  const uploader = rawInfo.uploader || ''
  const platform = platformLabel[audioMeta.platform] || audioMeta.platform || ''
  const originalUrl = videoUrl || rawInfo.webpage_url || ''

  const coverImg = coverUrl ? (
    <img
      src={coverUrl}
      alt={title}
      referrerPolicy="no-referrer"
      className="h-16 w-28 shrink-0 rounded-md object-cover shadow-md max-md:h-14 max-md:w-24"
    />
  ) : null

  const originalLink = originalUrl ? (
    <a
      href={originalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/25"
    >
      <ExternalLink className="h-3.5 w-3.5" />
      <span>原视频</span>
    </a>
  ) : null

  const metaLine = (
    <div className="flex flex-wrap items-center gap-2 text-sm text-white/70 max-md:gap-1.5 max-md:text-xs max-md:leading-snug">
      {uploader && <span className="min-w-0 break-words">{uploader}</span>}
      {uploader && platform && <span className="shrink-0 text-white/40">·</span>}
      {platform && <span className="shrink-0">{platform}</span>}
    </div>
  )

  return (
    <div className="relative mb-4 overflow-hidden rounded-lg">
      <div className="absolute inset-0">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="h-full w-full scale-110 object-cover blur-md brightness-[0.4]"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-blue-600 to-indigo-700" />
        )}
      </div>

      {/* 桌面：封面 + 标题/UP + 原视频 */}
      <div className="relative hidden items-center gap-4 px-5 py-4 md:flex">
        {coverImg}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-bold text-white" title={title}>
            {title}
          </h2>
          <div className="mt-1">{metaLine}</div>
        </div>
        {originalLink}
      </div>

      {/* 手机：第一行封面+标题，第二行 UP · 平台 + 原视频 */}
      <div className="relative flex flex-col gap-2 px-3 py-3 md:hidden">
        <div className="flex items-start gap-2">
          {coverUrl && (
            <img
              src={coverUrl}
              alt={title}
              referrerPolicy="no-referrer"
              className="h-14 w-24 shrink-0 rounded-md object-cover shadow-md"
            />
          )}
          <h2
            title={title}
            className="h-14 min-w-0 flex-1 overflow-hidden text-[10px] leading-tight font-medium text-white line-clamp-4"
          >
            {title}
          </h2>
        </div>
        <div className="flex min-w-0 items-center gap-1.5 text-[10px] leading-snug text-white/70">
          {uploader && <span className="min-w-0 truncate">{uploader}</span>}
          {uploader && platform && <span className="shrink-0 text-white/40">·</span>}
          {platform && <span className="shrink-0">{platform}</span>}
          {originalUrl && (
            <a
              href={originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm"
            >
              <ExternalLink className="h-3 w-3" />
              <span>原视频</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
