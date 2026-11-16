import Link from 'next/link'

import { cn } from '@/lib/cn'

import { ChevronLeftIcon, ChevronRightIcon } from './icons'

/** Numbered pagination with previous and next. Shows up to five page numbers around the current page. */
export function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number
  totalPages: number
  hrefFor: (page: number) => string
}) {
  if (totalPages <= 1) return null
  const start = Math.max(1, Math.min(page - 2, totalPages - 4))
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i)
  const box =
    'inline-flex min-h-touch min-w-touch items-center justify-center rounded-button no-underline'
  const idle = cn(box, 'border border-line bg-white font-semibold text-navy hover:border-navy')
  const disabled = cn(box, 'border border-line bg-white text-line-strong')
  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-wrap justify-center gap-1.5">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} aria-label="Previous page" className={idle}>
          <ChevronLeftIcon />
        </Link>
      ) : (
        <span aria-hidden="true" className={disabled}>
          <ChevronLeftIcon />
        </span>
      )}
      {pages.map((p) =>
        p === page ? (
          <span key={p} aria-current="page" className={cn(box, 'bg-night font-bold text-white')}>
            <span className="sr-only">Page </span>
            {p}
          </span>
        ) : (
          <Link key={p} href={hrefFor(p)} className={idle}>
            <span className="sr-only">Page </span>
            {p}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} aria-label="Next page" className={idle}>
          <ChevronRightIcon />
        </Link>
      ) : (
        <span aria-hidden="true" className={disabled}>
          <ChevronRightIcon />
        </span>
      )}
    </nav>
  )
}
