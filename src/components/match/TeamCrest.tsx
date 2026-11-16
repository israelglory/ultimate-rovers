import Image from 'next/image'

import { cn } from '@/lib/cn'
import type { TeamRef } from '@/lib/types'

/** Crest proportions of the supplied club crest (333 x 379). */
const CLUB_RATIO = 379 / 333

/**
 * A team's crest at a fixed width, or the dashed circle placeholder drawn in the designs when an
 * opponent has no crest yet. Decorative: the team name always sits next to it.
 */
export function TeamCrest({
  team,
  size,
  tone = 'light',
  className,
  priority = false,
  fluid = false,
}: {
  team: Pick<TeamRef, 'crest' | 'isUs'>
  /** Rendered width in px, and the intrinsic size requested from the image optimiser. */
  size: number
  tone?: 'light' | 'dark'
  className?: string
  priority?: boolean
  /** Width comes from className (responsive sizes) instead of `size`. */
  fluid?: boolean
}) {
  const src = team.crest?.url ?? (team.isUs ? '/crest.png' : null)
  if (src) {
    const ratio = team.crest ? team.crest.height / team.crest.width : CLUB_RATIO
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={Math.round(size * ratio)}
        loading={priority ? 'eager' : undefined}
        sizes={`${size}px`}
        className={cn('block h-auto shrink-0', className)}
        style={fluid ? { height: 'auto' } : { width: size, height: 'auto' }}
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        'box-border block shrink-0 rounded-full border-2 border-dashed',
        fluid && 'aspect-square',
        tone === 'dark' ? 'border-placeholder-on-dark' : 'border-placeholder-on-light',
        className,
      )}
      style={fluid ? undefined : { width: size, height: size }}
    />
  )
}
