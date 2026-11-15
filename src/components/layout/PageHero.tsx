import type { ReactNode } from 'react'

import { Motif } from '@/components/ui/Motif'
import { cn } from '@/lib/cn'

/**
 * Page header band used on Fixtures, Squad, Stakeholders, News and Contact:
 * Night background, centre-circle motif top right, display title, optional intro,
 * optional aside next to the title (News search) and optional filter row.
 */
export function PageHero({
  id,
  title,
  intro,
  introClassName,
  aside,
  children,
  flush = false,
  className,
}: {
  id: string
  title: ReactNode
  intro?: ReactNode
  introClassName?: string
  aside?: ReactNode
  children?: ReactNode
  /** No bottom padding, for folder tabs that sit on the bottom edge (Fixtures). */
  flush?: boolean
  className?: string
}) {
  return (
    <section
      aria-labelledby={id}
      className={cn('relative overflow-hidden bg-night text-white', className)}
    >
      <Motif
        variant="page"
        className="pointer-events-none absolute -top-10 -right-20 h-auto w-[600px]"
      />
      <div className={cn('wrap relative pt-14', flush ? 'pb-0' : 'pb-12')}>
        {aside ? (
          <div className="flex flex-wrap items-end justify-between gap-5">
            <h1 id={id} className="m-0 font-display text-page-title font-black">
              {title}
            </h1>
            {aside}
          </div>
        ) : (
          <h1 id={id} className="m-0 font-display text-page-title font-black">
            {title}
          </h1>
        )}
        {intro ? (
          <p
            className={cn(
              'mt-4 max-w-[560px] text-[18px] leading-[1.55] text-mist-text',
              introClassName,
            )}
          >
            {intro}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  )
}
