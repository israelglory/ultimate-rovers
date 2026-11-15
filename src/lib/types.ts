/**
 * View models used by pages and components. The data layer maps Payload documents into
 * these shapes so UI code never depends on CMS internals.
 */

export type ImageRef = {
  url: string
  alt: string
  width: number
  height: number
  focalX?: number | null
  focalY?: number | null
}

export type TeamRef = {
  id: number
  name: string
  shortName: string
  slug: string
  isUs: boolean
  crest: ImageRef | null
}

export type CompetitionType = 'league' | 'cup' | 'friendly'

export type CompetitionRef = {
  id: number
  name: string
  shortName: string
  type: CompetitionType
  season: string
}

export type MatchStatus =
  'scheduled' | 'live' | 'half_time' | 'full_time' | 'postponed' | 'cancelled'
export type Side = 'home' | 'away'
export type EventType =
  'goal' | 'own_goal' | 'penalty' | 'yellow' | 'second_yellow' | 'red' | 'substitution'
export type TicketAvailability = 'not_on_sale' | 'on_sale' | 'members_only' | 'sold_out'

export type PersonLink = { name: string; slug: string | null }

export type MatchEvent = {
  id: string
  minute: number
  addedTime: number | null
  side: Side
  type: EventType
  player: PersonLink | null
  related: PersonLink | null
  note: string | null
}

export type MatchSummary = {
  id: number
  slug: string
  title: string
  kickoff: string
  timezone: string
  status: MatchStatus
  minute: number | null
  competition: CompetitionRef
  season: string
  matchweek: number | null
  venue: string | null
  home: TeamRef
  away: TeamRef
  homeScore: number | null
  awayScore: number | null
  halfTimeHomeScore: number | null
  halfTimeAwayScore: number | null
  ticketUrl: string | null
  ticketAvailability: TicketAvailability
  broadcast: string | null
  watchUrl: string | null
  statusNote: string | null
  hasHighlights: boolean
}

export type LineupPlayer = {
  name: string
  number: number | null
  slug: string | null
  x: number | null
  y: number | null
}

export type Lineup = {
  formation: string | null
  headCoach: string | null
  starting: LineupPlayer[]
  substitutes: LineupPlayer[]
}

export type TeamStats = {
  possession: number | null
  shots: number | null
  shotsOnTarget: number | null
  corners: number | null
  passesCompleted: number | null
  fouls: number | null
  offsides: number | null
  yellowCards: number | null
}

export type VideoRef = {
  id: string
  title: string
  url: string | null
  fileUrl: string | null
  fileType: string | null
  poster: ImageRef | null
  durationSeconds: number | null
  caption: string | null
}

export type PlayerRef = {
  id: number
  slug: string
  firstName: string
  surname: string
  squadNumber: number | null
  positionGroup: PositionGroup
  position: string | null
  nationality: string | null
  photo: ImageRef | null
}

export type PositionGroup = 'goalkeeper' | 'defender' | 'midfielder' | 'forward'

/** Lexical rich text as stored by Payload. Rendered by components/content/RichText. */
export type RichTextValue = {
  root: { children: unknown[]; [key: string]: unknown }
  [key: string]: unknown
}

export type MatchReport = {
  headline: string
  standfirst: string | null
  author: string | null
  heroImage: ImageRef | null
  body: RichTextValue | null
  coachQuote: string | null
  articleSlug: string | null
}

export type MatchDetail = MatchSummary & {
  referee: string | null
  attendance: number | null
  ticketInfo: string | null
  events: MatchEvent[]
  lineupsConfirmed: boolean
  lineups: { home: Lineup; away: Lineup }
  stats: { home: TeamStats; away: TeamStats } | null
  preview: string | null
  teamNews: { home: string[]; away: string[] }
  playerOfTheMatch: PlayerRef | null
  highlights: VideoRef | null
  report: MatchReport | null
}

export type StandingRow = {
  team: TeamRef
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: FormResult[]
  position: number
}

export type FormResult = 'W' | 'D' | 'L'

export type StatLine = {
  appearances: number
  starts: number
  goals: number
  assists: number
  minutes: number
  shotsOnTarget: number
  yellowCards: number
  redCards: number
}
