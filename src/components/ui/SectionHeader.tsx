import Link from 'next/link'
import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

/** Display heading with an optional "All results"-style link on the right. */
export function SectionHeader({
  id,
  title,
  href,
  linkLabel,
  size = 'section',
  className,
}: {
  id: string
  title: ReactNode
  href?: string
  linkLabel?: string
  size?: 'section' | 'secondary' | 'mobile'
  className?: string
}) {
  return (
    <div className={cn('mb-6 flex flex-wrap items-baseline justify-between gap-4', className)}>
      <h2
        id={id}
        className={cn(
          'm-0 font-display leading-none font-black',
          size === 'section' && 'text-[36px] md:text-section',
          size === 'secondary' && 'text-[36px] md:text-[48px]',
          size === 'mobile' && 'text-[36px]',
        )}
      >
        {title}
      </h2>
      {href && linkLabel ? (
        <Link href={href} className="text-[14px] font-semibold md:text-[15px]">
          {linkLabel}
        </Link>
      ) : null}
    </div>
  )
}
