import { z } from 'zod'

/** Every shareable UI state lives in the URL. Invalid values fall back to the default. */

type Raw = Record<string, string | string[] | undefined>

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

const pick = <T extends z.ZodType>(schema: T, value: unknown, fallback: z.infer<T>): z.infer<T> => {
  const parsed = schema.safeParse(value)
  return parsed.success ? parsed.data : fallback
}

export const fixtureViews = ['fixtures', 'results', 'table'] as const
export type FixtureView = (typeof fixtureViews)[number]
export const competitionFilters = ['league', 'cup', 'friendly'] as const
export type CompetitionFilter = (typeof competitionFilters)[number]

/** Seasons travel in URLs as 2026-27 and are stored as 2026/27. */
export const seasonToParam = (season: string) => season.replace('/', '-')
export const seasonFromParam = (param: string | undefined): string | undefined =>
  param && /^\d{4}-\d{2}$/.test(param) ? param.replace('-', '/') : undefined

export function parseFixturesParams(raw: Raw) {
  return {
    view: pick(z.enum(fixtureViews), first(raw.view), 'fixtures'),
    competition: pick(z.enum(competitionFilters).optional(), first(raw.competition), undefined),
    season: seasonFromParam(first(raw.season)),
  }
}

export const positionFilters = ['goalkeepers', 'defenders', 'midfielders', 'forwards'] as const
export type PositionFilter = (typeof positionFilters)[number]

export const positionFilterToGroup = {
  goalkeepers: 'goalkeeper',
  defenders: 'defender',
  midfielders: 'midfielder',
  forwards: 'forward',
} as const

export function parseSquadParams(raw: Raw) {
  return { position: pick(z.enum(positionFilters).optional(), first(raw.position), undefined) }
}

export const matchTabs = ['overview', 'lineups', 'stats', 'report', 'h2h'] as const

export function parseMatchParams(raw: Raw) {
  return { tab: pick(z.enum(matchTabs).optional(), first(raw.tab), undefined) }
}

export function parsePlayerParams(raw: Raw) {
  return { stats: pick(z.enum(['season', 'career']), first(raw.stats), 'season') }
}

export const newsCategories = [
  'match-report',
  'match-preview',
  'squad-news',
  'club',
  'academy',
  'community',
] as const
export type NewsCategory = (typeof newsCategories)[number]

export function parseNewsParams(raw: Raw) {
  const q = (first(raw.q) ?? '').trim().slice(0, 100)
  return {
    category: pick(z.enum(newsCategories).optional(), first(raw.category), undefined),
    q: q === '' ? undefined : q,
    page: pick(z.coerce.number().int().min(1).max(500), first(raw.page), 1),
  }
}

export const contactTopicValues = [
  'general',
  'tickets',
  'partnerships',
  'media',
  'academy',
] as const
export type ContactTopic = (typeof contactTopicValues)[number]

export function parseContactParams(raw: Raw) {
  return { topic: pick(z.enum(contactTopicValues), first(raw.topic), 'general') }
}

/** Builds a query string from defined values only, so default states keep clean URLs. */
export function toQuery(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  }
  const s = search.toString()
  return s ? `?${s}` : ''
}
