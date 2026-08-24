/** 将外链封面经 BiliNoteView API 代理，避免 HTTPS 混合内容与 B 站防盗链。 */
export function normalizeRemoteUrl(url: string): string {
  const trimmed = (url || '').trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('//')) return `https:${trimmed}`
  if (trimmed.startsWith('http://')) return `https://${trimmed.slice('http://'.length)}`
  return trimmed
}

export function apiBaseUrl(): string {
  return String(import.meta.env.VITE_API_BASE_URL || '/api/bilinote/view/api').replace(/\/$/, '')
}

export function proxiedImageUrl(rawUrl?: string): string {
  const normalized = normalizeRemoteUrl(rawUrl || '')
  if (!normalized) return ''
  if (normalized.startsWith('/')) {
    return `${publicAsset(normalized.replace(/^\//, ''))}`
  }
  return `${apiBaseUrl()}/image_proxy?url=${encodeURIComponent(normalized)}`
}

export function publicAsset(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${path.replace(/^\//, '')}`
}

export function coverOrPlaceholder(rawUrl?: string): string {
  return proxiedImageUrl(rawUrl) || publicAsset('placeholder.png')
}
