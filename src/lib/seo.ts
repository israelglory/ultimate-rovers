import type { Metadata } from 'next'

import { siteUrl } from '@/lib/site'

/** Per-page title, description, canonical URL, Open Graph and X card. */
export function pageMetadata({
  title,
  description,
  path,
  image,
  type = 'website',
  noIndex = false,
}: {
  title: string
  description: string
  path: string
  image?: string
  type?: 'website' | 'article' | 'profile'
  noIndex?: boolean
}): Metadata {
  const url = `${siteUrl()}${path}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Ultimate Rovers',
      locale: 'en_GB',
      type,
      ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  }
}

const eventStatus: Record<string, string> = {
  postponed: 'https://schema.org/EventPostponed',
  cancelled: 'https://schema.org/EventCancelled',
}

const team = (t: { name: string }) => ({ '@type': 'SportsTeam', name: t.name, sport: 'Football' })

/** SportsEvent for a match page. */
export function sportsEventJsonLd(m: {
  title: string
  slug: string
  kickoff: string
  status: string
  venue: string | null
  competition: { name: string }
  home: { name: string }
  away: { name: string }
  homeScore: number | null
  awayScore: number | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${m.title}, ${m.competition.name}`,
    sport: 'Football',
    startDate: m.kickoff,
    url: `${siteUrl()}/matches/${m.slug}`,
    eventStatus: eventStatus[m.status] ?? 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    homeTeam: team(m.home),
    awayTeam: team(m.away),
    competitor: [team(m.home), team(m.away)],
    ...(m.venue ? { location: { '@type': 'Place', name: m.venue } } : {}),
    organizer: { '@type': 'SportsOrganization', name: m.competition.name },
  }
}

/** SportsTeam for Home. */
export function sportsTeamJsonLd(club: {
  name: string
  shortBio: string | null
  city: string | null
  socials: Array<{ url: string }>
  groundName: string | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name: club.name,
    sport: 'Football',
    url: siteUrl(),
    logo: `${siteUrl()}/crest.png`,
    ...(club.shortBio ? { description: club.shortBio } : {}),
    ...(club.groundName ? { location: { '@type': 'Place', name: club.groundName } } : {}),
    ...(club.socials.length ? { sameAs: club.socials.map((s) => s.url) } : {}),
  }
}

/** Person for a player profile. */
export function personJsonLd(p: {
  firstName: string
  surname: string
  slug: string
  nationality: string | null
  dateOfBirth: string | null
  heightCm: number | null
  position: string
  clubName: string
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: `${p.firstName} ${p.surname}`,
    givenName: p.firstName,
    familyName: p.surname,
    url: `${siteUrl()}/squad/${p.slug}`,
    jobTitle: `Footballer, ${p.position}`,
    memberOf: { '@type': 'SportsTeam', name: p.clubName, sport: 'Football' },
    ...(p.nationality ? { nationality: p.nationality } : {}),
    ...(p.dateOfBirth ? { birthDate: p.dateOfBirth.slice(0, 10) } : {}),
    ...(p.heightCm
      ? { height: { '@type': 'QuantitativeValue', value: p.heightCm, unitCode: 'CMT' } }
      : {}),
    ...(p.image ? { image: p.image } : {}),
  }
}

/** NewsArticle for an article page. */
export function newsArticleJsonLd(a: {
  title: string
  standfirst: string
  slug: string
  publishedAt: string
  author: string | null
  image?: string
  clubName: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: a.title,
    description: a.standfirst,
    url: `${siteUrl()}/news/${a.slug}`,
    mainEntityOfPage: `${siteUrl()}/news/${a.slug}`,
    datePublished: a.publishedAt,
    author: a.author
      ? { '@type': 'Person', name: a.author }
      : { '@type': 'Organization', name: a.clubName },
    publisher: {
      '@type': 'Organization',
      name: a.clubName,
      logo: { '@type': 'ImageObject', url: `${siteUrl()}/crest.png` },
    },
    ...(a.image ? { image: [a.image] } : {}),
  }
}
