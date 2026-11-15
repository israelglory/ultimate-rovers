import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

/** Dashed panel used when a list has nothing to show. Copy comes from the designs. */
export function EmptyState({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        'm-0 rounded-card border border-dashed border-line-strong bg-white p-8 text-center text-slate',
        className,
      )}
    >
      {children}
    </p>
  )
}
