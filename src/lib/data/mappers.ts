import type { Competition, Match, Media, Player, Team, Video } from '@/payload-types'
import type {
  CompetitionRef,
  ImageRef,
  Lineup,
  LineupPlayer,
  MatchEvent,
  MatchSummary,
  PersonLink,
  PlayerRef,
  TeamRef,
  TeamStats,
  VideoRef,
} from '@/lib/types'

/** A relationship is either an id or the populated document; return the document or null. */
export function populated<T extends object>(
  value: number | string | T | null | undefined,
): T | null {
  return value && typeof value === 'object' ? value : null
}

export function relationId(value: number | { id: number } | null | undefined): number | null {
  if (value == null) return null
  return typeof value === 'number' ? value : value.id
}

/**
 * Payload builds absolute URLs from serverURL. Uploads are always served through /api/<collection>/file
 * (also with S3, which Payload proxies), so keep the path only: next/image treats it as local and
 * the site works under any domain. Query strings are dropped so local image patterns match.
 */
export const cleanUrl = (url: string) => {
  try {
    return new URL(url, 'http://localhost').pathname
  } catch {
    return url.split('?')[0] ?? url
  }
}

export function toImage(
  value: number | Media | null | undefined,
  size?: 'thumb' | 'card' | 'hero',
): ImageRef | null {
  const media = populated(value)
  if (!media?.url || !media.mimeType?.startsWith('image/')) return null
  const variant = size ? media.sizes?.[size] : undefined
  const url = variant?.url ?? media.url
  const width = variant?.width ?? media.width ?? 800
  const height = variant?.height ?? media.height ?? 600
  return {
    url: cleanUrl(url),
    alt: media.alt === 'Decorative' ? '' : (media.alt ?? ''),
    width,
    height,
    focalX: media.focalX ?? null,
    focalY: media.focalY ?? null,
  }
}

export function toTeam(value: number | Team | null | undefined): TeamRef {
  const team = populated(value)
  if (!team) {
    return {
      id: relationId(value as number) ?? 0,
      name: 'To be confirmed',
      shortName: 'TBC',
      slug: '',
      isUs: false,
      crest: null,
    }
  }
  return {
    id: team.id,
    name: team.name,
    shortName: team.shortName || team.name,
    slug: team.slug ?? '',
    isUs: Boolean(team.isUs),
    crest: toImage(team.crest, 'thumb'),
  }
}

export function toCompetition(value: number | Competition | null | undefined): CompetitionRef {
  const c = populated(value)
  if (!c)
    return { id: 0, name: 'Competition', shortName: 'Competition', type: 'league', season: '' }
  return {
    id: c.id,
    name: c.name,
    shortName: c.shortName || c.name,
    type: c.type,
    season: c.season,
  }
}

const playerName = (p: Player) => `${p.firstName} ${p.surname}`.trim()

export function toPersonLink(
  rel: number | Player | null | undefined,
  fallback?: string | null,
): PersonLink | null {
  const player = populated(rel)
  if (fallback && fallback.trim() !== '') return { name: fallback, slug: player?.slug ?? null }
  if (player) return { name: playerName(player), slug: player.slug ?? null }
  return null
}

export function toMatchSummary(m: Match): MatchSummary {
  return {
    id: m.id,
    slug: m.slug ?? String(m.id),
    title: m.title ?? '',
    kickoff: m.kickoff,
    timezone: m.kickoff_tz || 'Africa/Lagos',
    status: m.status,
    minute: m.minute ?? null,
    competition: toCompetition(m.competition),
    season: m.season,
    matchweek: m.matchweek ?? null,
    venue: m.venue ?? null,
    home: toTeam(m.homeTeam),
    away: toTeam(m.awayTeam),
    homeScore: m.homeScore ?? null,
    awayScore: m.awayScore ?? null,
    halfTimeHomeScore: m.halfTimeHomeScore ?? null,
    halfTimeAwayScore: m.halfTimeAwayScore ?? null,
    broadcast: m.broadcast ?? null,
    watchUrl: m.watchUrl ?? null,
    statusNote: m.statusNote ?? null,
    hasHighlights: Boolean(m.highlights),
  }
}

export function toEvents(m: Match): MatchEvent[] {
  return (m.events ?? []).map((e, i) => ({
    id: e.id ?? `event-${i}`,
    minute: e.minute,
    addedTime: e.addedTime ?? null,
    side: e.side,
    type: e.type,
    player: toPersonLink(e.player, e.playerName),
    related: toPersonLink(e.relatedPlayer, e.relatedPlayerName),
    note: e.note ?? null,
  }))
}

type RawLineup = NonNullable<Match['homeLineup']>
type RawLineupEntry = {
  player?: number | Player | null
  name?: string | null
  number?: number | null
  x?: number | null
  y?: number | null
}

function toLineupPlayer(entry: RawLineupEntry): LineupPlayer {
  const player = populated(entry.player)
  const name = entry.name?.trim() || (player ? player.surname : 'Player')
  return {
    name,
    number: entry.number ?? player?.squadNumber ?? null,
    slug: player?.slug ?? null,
    x: entry.x ?? null,
    y: entry.y ?? null,
  }
}

export function toLineup(raw: RawLineup | null | undefined): Lineup {
  return {
    formation: raw?.formation ?? null,
    headCoach: raw?.headCoach ?? null,
    starting: (raw?.starting ?? []).map(toLineupPlayer),
    substitutes: (raw?.substitutes ?? []).map(toLineupPlayer),
  }
}

export function toTeamStats(raw: Match['homeStats'] | null | undefined): TeamStats {
  return {
    possession: raw?.possession ?? null,
    shots: raw?.shots ?? null,
    shotsOnTarget: raw?.shotsOnTarget ?? null,
    corners: raw?.corners ?? null,
    passesCompleted: raw?.passesCompleted ?? null,
    fouls: raw?.fouls ?? null,
    offsides: raw?.offsides ?? null,
    yellowCards: raw?.yellowCards ?? null,
  }
}

export function toPlayerRef(value: number | Player | null | undefined): PlayerRef | null {
  const p = populated(value)
  if (!p) return null
  return {
    id: p.id,
    slug: p.slug ?? String(p.id),
    firstName: p.firstName,
    surname: p.surname,
    squadNumber: p.squadNumber ?? null,
    positionGroup: p.positionGroup,
    position: p.position ?? null,
    nationality: p.nationality ?? null,
    photo: toImage(p.photo, 'card'),
  }
}

export function toVideo(value: number | Video | null | undefined): VideoRef | null {
  const v = populated(value)
  if (!v) return null
  const file = populated(v.file)
  return {
    id: String(v.id),
    title: v.title,
    url: v.url ?? null,
    fileUrl: file?.url ? cleanUrl(file.url) : null,
    fileType: file?.mimeType ?? null,
    poster: toImage(v.poster, 'hero'),
    durationSeconds: v.durationSeconds ?? null,
    caption: null,
  }
}
