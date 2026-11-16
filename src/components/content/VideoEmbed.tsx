'use client'

import Image from 'next/image'
import { useState } from 'react'

import { PlayIcon } from '@/components/ui/icons'
import { cn } from '@/lib/cn'
import { formatDuration } from '@/lib/format'
import type { ImageRef } from '@/lib/types'
import { parseVideoUrl } from '@/lib/video'

type Size = 'lg' | 'md' | 'sm'

const playSize: Record<Size, { circle: string; icon: number }> = {
  lg: { circle: 'size-[60px] md:size-[84px]', icon: 30 },
  md: { circle: 'size-[60px] md:size-[76px]', icon: 28 },
  sm: { circle: 'size-[52px]', icon: 20 },
}

/**
 * Video facade: a poster and play button first; the YouTube, Vimeo or MP4 player only loads after
 * a click, so nothing autoplays and third-party scripts stay off the page until wanted.
 */
export function VideoEmbed({
  title,
  url,
  fileUrl,
  poster,
  durationSeconds,
  size = 'md',
  tone = 'night',
  rounded = 'rounded-[14px]',
  playLabel,
  className,
}: {
  title: string
  url?: string | null
  fileUrl?: string | null
  poster?: ImageRef | null
  durationSeconds?: number | null
  size?: Size
  tone?: 'night' | 'raised'
  rounded?: string
  playLabel?: string
  className?: string
}) {
  const [playing, setPlaying] = useState(false)
  const source = parseVideoUrl(fileUrl ?? url ?? null)
  const duration = formatDuration(durationSeconds)
  const frame = cn(
    'relative block aspect-video w-full overflow-hidden',
    rounded,
    tone === 'night' ? 'bg-night' : 'bg-navy-raised',
    className,
  )

  if (playing && source) {
    if (source.kind === 'file') {
      return (
        <div className={frame}>
          <video
            className="absolute inset-0 size-full"
            src={source.src}
            controls
            autoPlay
            playsInline
            poster={poster?.url}
          >
            <track kind="captions" />
          </video>
        </div>
      )
    }
    return (
      <div className={frame}>
        <iframe
          className="absolute inset-0 size-full border-0"
          src={source.embedUrl}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    )
  }

  const inner = (
    <>
      {poster ? (
        <Image
          src={poster.url}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-cover"
        />
      ) : null}
      <span
        className={cn(
          'relative flex items-center justify-center rounded-full',
          source ? 'bg-cyan text-night' : 'bg-navy text-mist-text',
          playSize[size].circle,
        )}
      >
        <PlayIcon size={playSize[size].icon} />
      </span>
      {duration ? (
        <span className="absolute right-3 bottom-3 rounded bg-navy px-2 py-1 text-[13px] text-white">
          {duration}
        </span>
      ) : null}
      {!source ? (
        <span className="absolute bottom-3 left-3 rounded bg-navy px-2 py-1 text-[13px] text-white">
          Video coming soon
        </span>
      ) : null}
    </>
  )

  if (!source) {
    return (
      <div
        className={cn(frame, 'flex items-center justify-center')}
        role="img"
        aria-label={`${title}, video coming soon`}
      >
        {inner}
      </div>
    )
  }
  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={playLabel ?? `Play ${title}`}
      className={cn(frame, 'flex cursor-pointer items-center justify-center border-0 p-0')}
    >
      {inner}
    </button>
  )
}
