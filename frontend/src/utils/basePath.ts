/** Vite base（如 /bilinote/）；本地 dev 为 ./ 时返回 / */
export function resolveRouterBasename(): string {
  const base = import.meta.env.BASE_URL || '/'
  if (base === './' || base === '/') return '/'
  return base.replace(/\/$/, '')
}
