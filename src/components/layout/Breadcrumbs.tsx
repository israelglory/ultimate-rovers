import Link from 'next/link'
import type { ReactNode } from 'react'

export type Crumb = { label: string; href?: string }

/** White breadcrumb bar under the header, with optional actions on the right (player navigation). */
export function Breadcrumbs({ items, actions }: { items: Crumb[]; actions?: ReactNode }) {
  return (
    <nav aria-label="Breadcrumb" className="border-b border-line bg-white">
      <div className="wrap flex flex-wrap items-center justify-between gap-2">
        <ol className="m-0 flex min-h-12 list-none flex-wrap items-center gap-2 p-0 text-[14px]">
          {items.map((c, i) => (
            <li key={`${c.label}-${i}`} className="flex items-center gap-2">
              {i > 0 ? (
                <span aria-hidden="true" className="text-slate">
                  /
                </span>
              ) : null}
              {c.href ? (
                <Link href={c.href}>{c.label}</Link>
              ) : (
                <span aria-current="page" className="text-slate">
                  {c.label}
                </span>
              )}
            </li>
          ))}
        </ol>
        {actions}
      </div>
    </nav>
  )
}
