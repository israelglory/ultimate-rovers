'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type KeyboardEvent, useEffect, useRef } from 'react'

import { cn } from '@/lib/cn'

export type TabItem = { key: string; label: string; href: string }
export type TabVariant = 'folder' | 'underline' | 'segmented'

const styles: Record<TabVariant, { list: string; tab: (on: boolean) => string }> = {
  // Fixtures: tabs sit on the bottom edge of the dark hero; the active one merges into the page.
  folder: {
    list: 'flex gap-1',
    tab: (on) =>
      cn(
        'inline-flex min-h-[52px] items-center rounded-t-[10px] px-4 text-[16px] no-underline sm:px-6',
        on
          ? 'bg-chalk font-bold text-night hover:text-night'
          : 'bg-transparent font-semibold text-mist-text hover:text-white',
      ),
  },
  // Match centre: underline tabs on a white bar.
  underline: {
    list: 'relative flex gap-1 overflow-x-auto scrollbar-thin',
    tab: (on) =>
      cn(
        'inline-flex min-h-14 items-center whitespace-nowrap border-b-[3px] px-3.5 text-[15px] no-underline sm:px-5 sm:text-[16px]',
        on
          ? 'border-navy font-bold text-night hover:text-night'
          : 'border-transparent font-semibold text-slate hover:text-night',
      ),
  },
  // Player stats: segmented control on mist.
  segmented: {
    list: 'flex rounded-lg bg-mist p-1',
    tab: (on) =>
      cn(
        'inline-flex min-h-touch items-center rounded-button px-[18px] text-[14px] no-underline',
        on
          ? 'bg-night font-bold text-white hover:text-white'
          : 'bg-transparent font-semibold text-night hover:text-night',
      ),
  },
}

/**
 * ARIA tabs whose state lives in the URL. Each tab is a link, so it works without JavaScript and
 * can be shared; the server renders the selected panel. With JavaScript, arrow keys, Home and End
 * move between tabs and select them without adding history entries.
 */
export function TabList({
  label,
  items,
  active,
  idPrefix,
  variant,
  className,
}: {
  label: string
  items: TabItem[]
  active: string
  idPrefix: string
  variant: TabVariant
  className?: string
}) {
  const router = useRouter()
  const refs = useRef<Array<HTMLAnchorElement | null>>([])
  const s = styles[variant]

  // In a sideways-scrolling tab row (match centre on phones), bring the selected tab into view.
  // Only the row scrolls; the page itself never moves.
  useEffect(() => {
    const el = refs.current[items.findIndex((i) => i.key === active)]
    const row = el?.parentElement
    if (!el || !row || row.scrollWidth <= row.clientWidth) return
    // The row is position: relative, so offsetLeft is measured from the row itself.
    const left = el.offsetLeft
    if (left < row.scrollLeft || left + el.offsetWidth > row.scrollLeft + row.clientWidth) {
      row.scrollLeft = Math.max(0, left - 16)
    }
  }, [active, items])

  function onKeyDown(event: KeyboardEvent<HTMLAnchorElement>, index: number) {
    const last = items.length - 1
    const next =
      event.key === 'ArrowRight'
        ? index === last
          ? 0
          : index + 1
        : event.key === 'ArrowLeft'
          ? index === 0
            ? last
            : index - 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : null
    if (event.key === ' ') {
      event.preventDefault()
      router.replace(items[index]!.href, { scroll: false })
      return
    }
    if (next === null) return
    event.preventDefault()
    refs.current[next]?.focus()
    router.replace(items[next]!.href, { scroll: false })
  }

  return (
    <div role="tablist" aria-label={label} className={cn(s.list, className)}>
      {items.map((item, i) => {
        const on = item.key === active
        return (
          <Link
            key={item.key}
            ref={(el) => {
              refs.current[i] = el
            }}
            id={`${idPrefix}-tab-${item.key}`}
            href={item.href}
            role="tab"
            aria-selected={on}
            aria-controls={`${idPrefix}-panel`}
            tabIndex={on ? 0 : -1}
            replace
            scroll={false}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={s.tab(on)}
          >
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}

/** The panel for the selected tab, rendered on the server. */
export function TabPanel({
  idPrefix,
  active,
  children,
  className,
}: {
  idPrefix: string
  active: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      id={`${idPrefix}-panel`}
      role="tabpanel"
      aria-labelledby={`${idPrefix}-tab-${active}`}
      tabIndex={0}
      className={cn('outline-offset-4', className)}
    >
      {children}
    </div>
  )
}
