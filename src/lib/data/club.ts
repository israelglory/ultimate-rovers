import 'server-only'

import type { SocialLink } from '@/components/ui/SocialLinks'

export type SiteChrome = {
  clubName: string
  shortBio: string
  ticketsHref: string
  socials: SocialLink[]
}

/** Header and footer data. Reads Club settings from Phase 2 onwards. */
export async function getSiteChrome(): Promise<SiteChrome> {
  return {
    clubName: 'Ultimate Rovers',
    shortBio: '[Short line about the club, its home and the community it plays for.]',
    ticketsHref: '/fixtures',
    socials: [],
  }
}
