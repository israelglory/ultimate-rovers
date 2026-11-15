import Image from 'next/image'

import { cn } from '@/lib/cn'
import type { ImageRef } from '@/lib/types'

/** The player's cut-out photo, or the silhouette drawn in the designs when there is none. */
export function PlayerSilhouette({
  photo,
  className,
  sizes,
  priority = false,
}: {
  photo: ImageRef | null
  className?: string
  sizes: string
  priority?: boolean
}) {
  if (photo) {
    return (
      <Image
        src={photo.url}
        alt=""
        width={photo.width}
        height={photo.height}
        sizes={sizes}
        loading={priority ? 'eager' : undefined}
        fetchPriority={priority ? 'high' : undefined}
        className={cn('relative block h-auto', className)}
      />
    )
  }
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 220"
      className={cn('relative block h-auto', className)}
    >
      <circle cx="100" cy="72" r="42" className="fill-navy-silhouette" />
      <path d="M18 220c0-62 36-98 82-98s82 36 82 98z" className="fill-navy-silhouette" />
    </svg>
  )
}
