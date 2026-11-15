import Image from 'next/image'
import Link from 'next/link'

import { NewsletterForm } from '@/components/forms/NewsletterForm'
import { type SocialLink, SocialLinks } from '@/components/ui/SocialLinks'
import { subscribeToNewsletter } from '@/app/actions'
import {
  footerClubLinks,
  footerMatchdayLinks,
  footerMobileLinks,
  legalLinks,
  type NavItem,
} from '@/lib/navigation'

const linkClass = 'text-[15px] text-mist-text no-underline hover:text-white'

function FooterColumn({ label, links }: { label: string; links: readonly NavItem[] }) {
  return (
    <nav aria-label={label} className="hidden flex-[0_1_160px] flex-col gap-1 sm:flex">
      <p className="m-0 mb-2 text-[15px] font-bold">{label}</p>
      {links.map((l) => (
        <Link key={l.href} href={l.href} className={`${linkClass} py-1.5`}>
          {l.label}
        </Link>
      ))}
    </nav>
  )
}

export function SiteFooter({
  clubName,
  shortBio,
  socials,
}: {
  clubName: string
  shortBio: string
  socials: SocialLink[]
}) {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-line-dark bg-night text-white sm:border-t-0">
      <div className="wrap flex flex-wrap gap-x-10 gap-y-5 pt-8 pb-7 sm:gap-10 sm:pt-16 sm:pb-8">
        <div className="min-w-0 flex-[1_1_280px]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Image
              src="/crest.png"
              alt=""
              width={56}
              height={64}
              className="h-auto w-11 sm:w-14"
              style={{ height: 'auto' }}
            />
            <span className="font-display text-[24px] leading-none font-extrabold uppercase sm:text-[28px]">
              {clubName}
            </span>
          </div>
          <p className="m-0 mt-4 hidden max-w-[320px] text-[15px] leading-[1.6] text-mist-text sm:block">
            {shortBio}
          </p>
          <SocialLinks links={socials} className="mt-5 hidden sm:flex" />
        </div>

        <FooterColumn label="Club" links={footerClubLinks} />
        <FooterColumn label="Matchday" links={footerMatchdayLinks} />

        <nav aria-label="Footer" className="grid w-full grid-cols-2 gap-x-3 gap-y-1 sm:hidden">
          {footerMobileLinks.map((l) => (
            <Link key={l.href} href={l.href} className={`${linkClass} py-2.5`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <SocialLinks links={socials} className="w-full sm:hidden" />

        <div className="w-full min-w-0 sm:w-auto sm:flex-[1_1_300px]">
          <p className="m-0 mb-2 text-[15px] font-bold">Club newsletter</p>
          <p className="m-0 mb-3.5 text-[15px] leading-normal text-mist-text">
            Team news, ticket releases and match reports in your inbox.
          </p>
          <NewsletterForm action={subscribeToNewsletter} />
        </div>
      </div>
      <div className="border-t border-line-dark">
        <div className="wrap flex flex-wrap justify-between gap-3 py-5 text-[13px] text-mist-text sm:text-[14px]">
          <span>
            © {year} {clubName}. All rights reserved.
          </span>
          <ul className="m-0 flex list-none flex-wrap gap-5 p-0">
            {legalLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-mist-text hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
