import Image from 'next/image'
import Link from 'next/link'

import { buttonClass } from '@/components/ui/Button'

import { MobileNav } from './MobileNav'
import { DesktopNavLinks } from './NavLinks'

export function SiteHeader({ clubName, ticketsHref }: { clubName: string; ticketsHref: string }) {
  return (
    <header className="border-b-[3px] border-cyan bg-night text-white">
      <div className="wrap flex flex-wrap items-center justify-between gap-x-7 gap-y-3 py-2 nav:justify-start nav:py-2.5">
        <Link
          href="/"
          aria-label={`${clubName} home`}
          className="flex items-center gap-2.5 text-white no-underline hover:text-white nav:gap-3"
        >
          <Image
            src="/crest.png"
            alt=""
            width={46}
            height={52}
            loading="eager"
            className="block h-auto w-[38px] nav:w-[46px]"
          />
          <span className="font-display text-[22px] leading-none font-extrabold tracking-[0.02em] uppercase nav:text-[26px]">
            {clubName}
          </span>
        </Link>
        <nav aria-label="Main" className="hidden flex-auto flex-wrap gap-0.5 nav:flex">
          <DesktopNavLinks />
        </nav>
        <div className="hidden nav:block">
          <Link
            href={ticketsHref}
            className={buttonClass({
              variant: 'primary-dark',
              size: 'md',
              minH: 'min-h-touch',
              px: 'px-5',
            })}
          >
            Get tickets
          </Link>
        </div>
        <MobileNav clubName={clubName} ticketsHref={ticketsHref} />
      </div>
    </header>
  )
}
