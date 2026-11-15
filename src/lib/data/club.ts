import 'server-only'

import { unstable_cache } from 'next/cache'

import type { SocialLink, SocialPlatform } from '@/components/ui/SocialLinks'
import { CACHE_SECONDS, tags } from '@/lib/cache-tags'
import { getPayloadClient } from '@/lib/payload'
import type { ContactTopic } from '@/lib/search-params'
import type { ImageRef, RichTextValue } from '@/lib/types'

import { relationId, toImage } from './mappers'

export type Department = {
  topic: ContactTopic
  title: string
  text: string | null
  email: string
  showCard: boolean
}

export type ClubInfo = {
  name: string
  shortBio: string | null
  founded: string | null
  city: string | null
  country: string | null
  timezone: string
  currentSeason: string
  ticketsHref: string
  broadcastPartner: string | null
  crest: ImageRef | null
  ground: {
    name: string | null
    street: string | null
    city: string | null
    postcode: string | null
    capacity: number | null
    surface: string | null
    accessibleEntry: string | null
    mapUrl: string | null
    mapEmbedUrl: string | null
    photo: ImageRef | null
    guide: string | null
  }
  phone: string | null
  replyDays: number
  officeHours: string | null
  matchdayHours: string | null
  departments: Department[]
  faqs: Array<{ question: string; answer: string }>
  socials: SocialLink[]
  home: { heroIntro: string; spotlightIds: number[]; crestStory: string | null }
  about: {
    intro: string | null
    story: string[]
    crestElements: Array<{ title: string; text: string }>
    mission: string | null
    vision: string | null
    values: string | null
    academyText: string | null
    communityText: string | null
    academyImage: ImageRef | null
    communityImage: ImageRef | null
    membershipText: string | null
  }
  tickets: { season: string | null; matchday: string | null; match: string | null }
  partnershipText: string | null
  legal: {
    privacy: RichTextValue | null
    terms: RichTextValue | null
    cookies: RichTextValue | null
  }
}

const platforms: SocialPlatform[] = ['instagram', 'x', 'youtube', 'tiktok', 'facebook']

const text = (v: string | null | undefined) => (v && v.trim() !== '' ? v : null)

async function loadClub(): Promise<ClubInfo> {
  const payload = await getPayloadClient()
  const s = await payload.findGlobal({ slug: 'club-settings', depth: 1 })
  const socials = s.socials ?? {}
  return {
    name: s.clubName || 'Ultimate Rovers',
    shortBio: text(s.shortBio),
    founded: text(s.founded),
    city: text(s.city),
    country: text(s.country),
    timezone: s.timezone || 'Europe/London',
    currentSeason: s.currentSeason || '2026/27',
    ticketsHref: text(s.ticketsUrl) ?? '/fixtures',
    broadcastPartner: text(s.broadcastPartner),
    crest: toImage(s.crest),
    ground: {
      name: text(s.ground?.name),
      street: text(s.ground?.street),
      city: text(s.ground?.city),
      postcode: text(s.ground?.postcode),
      capacity: s.ground?.capacity ?? null,
      surface: text(s.ground?.surface),
      accessibleEntry: text(s.ground?.accessibleEntry),
      mapUrl: text(s.ground?.mapUrl),
      mapEmbedUrl: text(s.ground?.mapEmbedUrl),
      photo: toImage(s.ground?.photo, 'hero'),
      guide: text(s.ground?.guide),
    },
    phone: text(s.phone),
    replyDays: s.replyDays ?? 2,
    officeHours: text(s.officeHours),
    matchdayHours: text(s.matchdayHours),
    departments: (s.departments ?? []).map((d) => ({
      topic: d.topic,
      title: d.title,
      text: text(d.text),
      email: d.email,
      showCard: d.showCard !== false,
    })),
    faqs: (s.faqs ?? []).map((f) => ({ question: f.question, answer: f.answer })),
    socials: platforms
      .map((platform) => ({
        platform,
        url: text((socials as Record<string, string | null | undefined>)[platform]),
      }))
      .filter((l): l is SocialLink => l.url !== null),
    home: {
      heroIntro:
        text(s.heroIntro) ??
        'Fixtures, results, the squad and every story from the club, in one place.',
      spotlightIds: (s.spotlight ?? [])
        .map((p) => relationId(p))
        .filter((id): id is number => id !== null),
      crestStory: text(s.crestStory),
    },
    about: {
      intro: text(s.aboutIntro),
      story: (s.story ?? []).map((p) => p.paragraph),
      crestElements: (s.crestElements ?? []).map((c) => ({ title: c.title, text: c.text })),
      mission: text(s.mission),
      vision: text(s.vision),
      values: text(s.values),
      academyText: text(s.academyText),
      communityText: text(s.communityText),
      academyImage: toImage(s.academyImage, 'card'),
      communityImage: toImage(s.communityImage, 'card'),
      membershipText: text(s.membershipText),
    },
    tickets: {
      season: text(s.seasonTicketText),
      matchday: text(s.matchdayTicketText),
      match: text(s.matchTicketText),
    },
    partnershipText: text(s.partnershipText),
    legal: {
      privacy: (s.privacy as RichTextValue | null | undefined) ?? null,
      terms: (s.terms as RichTextValue | null | undefined) ?? null,
      cookies: (s.cookies as RichTextValue | null | undefined) ?? null,
    },
  }
}

export const getClub = unstable_cache(loadClub, ['club-settings'], {
  tags: [tags.club],
  revalidate: CACHE_SECONDS,
})

/** Department email for a Contact topic, falling back to the general enquiry address. */
export function departmentFor(club: ClubInfo, topic: ContactTopic): Department | undefined {
  return (
    club.departments.find((d) => d.topic === topic) ??
    club.departments.find((d) => d.topic === 'general')
  )
}

export type SiteChrome = {
  clubName: string
  shortBio: string
  ticketsHref: string
  socials: SocialLink[]
}

export async function getSiteChrome(): Promise<SiteChrome> {
  const club = await getClub()
  return {
    clubName: club.name,
    shortBio: club.shortBio ?? '',
    ticketsHref: club.ticketsHref,
    socials: club.socials,
  }
}
