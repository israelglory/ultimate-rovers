import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import '@/styles/globals.css'
import { bodyFont, displayFont } from '@/app/fonts'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { brand } from '@/lib/brand'
import { getSiteChrome } from '@/lib/data/club'

/**
 * Pages render per request on top of the tagged data cache (see PLAN.md section 3), so the build
 * never needs a database and CMS saves show up immediately.
 */
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { default: 'Ultimate Rovers', template: '%s | Ultimate Rovers' },
  description: 'Fixtures, results, the squad and every story from Ultimate Rovers, in one place.',
}

export const viewport: Viewport = {
  themeColor: brand.night,
  width: 'device-width',
  initialScale: 1,
}

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const chrome = await getSiteChrome()
  return (
    <html lang="en-GB" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteHeader clubName={chrome.clubName} ticketsHref={chrome.ticketsHref} />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <SiteFooter
          clubName={chrome.clubName}
          shortBio={chrome.shortBio}
          socials={chrome.socials}
        />
      </body>
    </html>
  )
}
