'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { CloseIcon, MenuIcon } from '@/components/ui/icons'
import { cn } from '@/lib/cn'
import { isNavActive, mainNav } from '@/lib/navigation'

/**
 * Menu button and full-height overlay below 900px (MobileHome.dc.html).
 * Uses a modal <dialog> so focus is trapped and Escape closes it. The dialog repeats the
 * header bar so the close button sits exactly where the menu button was.
 */
export function MobileNav({ clubName, ticketsHref }: { clubName: string; ticketsHref: string }) {
  const [open, setOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const pathname = usePathname() ?? '/'

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
    document.documentElement.style.overflow = open ? 'hidden' : ''
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="inline-flex size-touch items-center justify-center rounded-lg bg-navy text-white nav:hidden"
      >
        <MenuIcon />
      </button>

      <dialog
        ref={dialogRef}
        id="mobile-menu"
        aria-label="Menu"
        onClose={() => setOpen(false)}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-night p-0 text-white backdrop:bg-night"
      >
        <div className="flex items-center justify-between border-b-[3px] border-cyan px-4 py-2">
          <Link
            href="/"
            aria-label={`${clubName} home`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 text-white no-underline hover:text-white"
          >
            <Image src="/crest.png" alt="" width={38} height={43} className="h-auto w-[38px]" />
            <span className="font-display text-[22px] leading-none font-extrabold uppercase">
              {clubName}
            </span>
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="inline-flex size-touch items-center justify-center rounded-lg bg-navy text-white"
          >
            <CloseIcon />
          </button>
        </div>
        <nav aria-label="Main" className="flex flex-col px-4 pt-4 pb-8">
          {mainNav.map((item) => {
            const active = isNavActive(item.href, pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex min-h-[60px] items-center border-b border-line-dark font-display text-[34px] font-extrabold no-underline',
                  active ? 'text-cyan hover:text-cyan' : 'text-white hover:text-cyan',
                )}
              >
                {item.label}
              </Link>
            )
          })}
          <Link
            href={ticketsHref}
            onClick={() => setOpen(false)}
            className="mt-6 flex min-h-[52px] items-center justify-center rounded-button bg-cyan text-[16px] font-bold text-night no-underline hover:text-night"
          >
            Get tickets
          </Link>
        </nav>
      </dialog>
    </>
  )
}
