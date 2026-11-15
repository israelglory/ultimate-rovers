/** Absolute site URL without a trailing slash, read at runtime so one image serves any domain. */
export const siteUrl = (): string =>
  (process.env.SITE_URL || 'http://localhost:3000').replace(/\/+$/, '')

export const absoluteUrl = (path: string): string =>
  `${siteUrl()}${path.startsWith('/') ? path : `/${path}`}`
