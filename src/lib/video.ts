export type VideoSource =
  | { kind: 'youtube'; id: string; embedUrl: string }
  | { kind: 'vimeo'; id: string; embedUrl: string }
  | { kind: 'file'; src: string }

/**
 * Works out how to play a video link. Embeds never autoplay with sound: they load only
 * after a click, so `autoplay=1` merely starts the video the person asked for.
 */
export function parseVideoUrl(url: string | null | undefined): VideoSource | null {
  if (!url) return null
  let parsed: URL
  try {
    parsed = new URL(url, 'http://localhost')
  } catch {
    return null
  }
  const host = parsed.hostname.replace(/^www\./, '').replace(/^m\./, '')
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const id =
      parsed.searchParams.get('v') ??
      parsed.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{6,})/)?.[1] ??
      null
    return id
      ? {
          kind: 'youtube',
          id,
          embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
        }
      : null
  }
  if (host === 'youtu.be') {
    const id = parsed.pathname.slice(1).split('/')[0]
    return id
      ? {
          kind: 'youtube',
          id,
          embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
        }
      : null
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = parsed.pathname.match(/(\d{5,})/)?.[1]
    return id
      ? { kind: 'vimeo', id, embedUrl: `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1` }
      : null
  }
  if (/\.(mp4|webm)$/i.test(parsed.pathname)) return { kind: 'file', src: url }
  return null
}
