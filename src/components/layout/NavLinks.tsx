'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/cn'
import { isNavActive, mainNav } from '@/lib/navigation'

/** Desktop primary nav. Client only to read the pathname for aria-current. */
export function DesktopNavLinks() {
  const pathname = usePathname() ?? '/'
  return (
    <>
      {mainNav.map((item) => {
        const active = isNavActive(item.href, pathname)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'inline-flex min-h-touch items-center px-1.5 text-[14px] font-semibold no-underline lg:px-2 xl:px-3 xl:text-[15px]',
              active ? 'text-cyan hover:text-cyan' : 'text-white hover:text-cyan',
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </>
  )
}
