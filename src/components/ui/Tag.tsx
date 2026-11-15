import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

/** Competition tag on cyan-tint. */
export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex self-start rounded-pill bg-cyan-tint px-2.5 py-1 text-[13px] font-semibold text-cyan-tint-text',
        className,
      )}
    >
      {children}
    </span>
  )
}
