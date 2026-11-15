import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/cn'

export function chipClass(on: boolean, size: 'sm' | 'md' = 'sm'): string {
  return cn(
    'inline-flex min-h-touch items-center gap-1 rounded-pill border no-underline',
    size === 'md' ? 'px-[18px] text-[15px]' : 'px-4 text-[14px]',
    on
      ? 'border-cyan bg-cyan font-bold text-night hover:text-night'
      : 'border-border-dark bg-transparent font-semibold text-white hover:border-cyan hover:text-white',
  )
}

/**
 * Filter chip on a dark PageHero. A real submit button inside a GET form, so filters work
 * without JavaScript and the URL owns the state. `aria-pressed` reflects the current filter.
 */
export function FilterChip({
  on,
  size,
  children,
  className,
  ...rest
}: { on: boolean; size?: 'sm' | 'md'; children: ReactNode } & Omit<
  ComponentProps<'button'>,
  'children' | 'aria-pressed'
>) {
  return (
    <button
      type="submit"
      aria-pressed={on}
      className={cn(chipClass(on, size), className)}
      {...rest}
    >
      {children}
    </button>
  )
}
