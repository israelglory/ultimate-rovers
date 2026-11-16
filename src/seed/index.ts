import path from 'node:path'

import type { CollectionSlug, Payload } from 'payload'

import type { Match } from '@/payload-types'

import { type Block, richText } from './lexical'
import { placeholderPdf } from './pdf'
import { saturday } from './time'

/**
 * Placeholder content mirroring the bracketed copy in the designs, so every page renders on a
 * fresh install. Every string keeps the bracket convention, so nothing here can be mistaken for
 * a real club fact. Numbers (scores, standings, stats) only belong to placeholder teams and players.
 */

const ctx = { disableRevalidate: true, skipVideoValidation: true }
const TZ = 'Europe/London'
const SEASON = '2026/27'

type SeedOptions = { reset?: boolean; live?: boolean; now?: Date }

const wipeOrder: CollectionSlug[] = [
  'articles',
  'videos',
  'matches',
  'competitions',
  'players',
  'teams',
  'people',
  'partners',
  'honours',
  'timeline-entries',
  'documents',
  'contact-submissions',
  'newsletter-subscribers',
  'media',
]

/** Deterministic pseudo-random numbers so every seed run looks the same. */
function rng(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const placeholderBody = (lines: Block[]) => richText(lines)

export async function seed(
  payload: Payload,
  { reset = false, live = false, now = new Date() }: SeedOptions = {},
): Promise<boolean> {
  const { totalDocs } = await payload.count({ collection: 'matches', overrideAccess: true })
  if (totalDocs > 0 && !reset) {
    payload.logger.info(
      'Seed skipped: the database already has matches. Run `pnpm seed:reset` to replace everything.',
    )
    return false
  }

  if (reset) {
    for (const collection of wipeOrder) {
      await payload.delete({
        collection,
        where: { id: { exists: true } },
        overrideAccess: true,
        context: ctx,
      })
    }
    payload.logger.info('Seed: cleared existing content (users are kept).')
  }

  const random = rng(7)
  const pick = <T>(list: readonly T[]): T => list[Math.floor(random() * list.length)] as T

  // Media: the crest.
  const crest = await payload.create({
    collection: 'media',
    data: { alt: 'Ultimate Rovers crest' },
    filePath: path.resolve(process.cwd(), 'public/crest.png'),
    overrideAccess: true,
    context: ctx,
  })

  // Teams.
  const rovers = await payload.create({
    collection: 'teams',
    data: {
      name: 'Ultimate Rovers',
      shortName: 'Rovers',
      isUs: true,
      crest: crest.id,
      homeGround: '[Home ground name]',
    },
    overrideAccess: true,
    context: ctx,
  })
  const opponents: Array<{ id: number }> = []
  for (let i = 1; i <= 11; i += 1) {
    opponents.push(
      await payload.create({
        collection: 'teams',
        data: {
          name: `[Opponent FC ${i}]`,
          shortName: `[Opponent ${i}]`,
          homeGround: '[Opponent ground]',
        },
        overrideAccess: true,
        context: ctx,
      }),
    )
  }
  const opp = (n: number) => opponents[n - 1]!

  // Competitions.
  const standingsRows: Array<[number, number, number, number, number, number, string]> = [
    // team (0 = Rovers), W, D, L, GF, GA, form
    [4, 9, 2, 1, 25, 9, 'WWDWW'],
    [2, 8, 3, 1, 22, 10, 'WDWWL'],
    [0, 7, 3, 2, 20, 12, 'WDLWW'],
    [1, 6, 4, 2, 18, 13, 'DWWDL'],
    [6, 6, 2, 4, 17, 15, 'LWWDW'],
    [3, 5, 4, 3, 16, 14, 'DDWLW'],
    [5, 5, 2, 5, 14, 16, 'WLLWD'],
    [7, 4, 4, 4, 13, 14, 'DLWDL'],
    [8, 3, 5, 4, 12, 15, 'LDDWL'],
    [9, 3, 3, 6, 11, 18, 'LLDWL'],
    [10, 2, 3, 7, 9, 20, 'LDLLW'],
    [11, 1, 3, 8, 7, 25, 'LLDLL'],
  ]
  const league = await payload.create({
    collection: 'competitions',
    data: {
      name: '[League name]',
      shortName: '[League]',
      type: 'league',
      season: SEASON,
      standings: standingsRows.map(([team, won, drawn, lost, goalsFor, goalsAgainst, form]) => ({
        team: team === 0 ? rovers.id : opp(team).id,
        played: won + drawn + lost,
        won,
        drawn,
        lost,
        goalsFor,
        goalsAgainst,
        form,
      })),
    },
    overrideAccess: true,
    context: ctx,
  })
  const cup = await payload.create({
    collection: 'competitions',
    data: { name: '[Cup competition]', shortName: '[Cup]', type: 'cup', season: SEASON },
    overrideAccess: true,
    context: ctx,
  })
  const friendly = await payload.create({
    collection: 'competitions',
    data: { name: '[Friendly]', shortName: '[Friendly]', type: 'friendly', season: SEASON },
    overrideAccess: true,
    context: ctx,
  })
  const pastLeague = await payload.create({
    collection: 'competitions',
    data: { name: '[League name]', shortName: '[League]', type: 'league', season: '2025/26' },
    overrideAccess: true,
    context: ctx,
  })

  // Players, numbered as drawn in Squad.dc.html.
  const squadPlan: Array<[number, 'goalkeeper' | 'defender' | 'midfielder' | 'forward']> = [
    [1, 'goalkeeper'],
    [13, 'goalkeeper'],
    [23, 'goalkeeper'],
    [2, 'defender'],
    [3, 'defender'],
    [4, 'defender'],
    [5, 'defender'],
    [6, 'defender'],
    [15, 'defender'],
    [7, 'midfielder'],
    [8, 'midfielder'],
    [10, 'midfielder'],
    [14, 'midfielder'],
    [16, 'midfielder'],
    [18, 'midfielder'],
    [9, 'forward'],
    [11, 'forward'],
    [17, 'forward'],
    [19, 'forward'],
  ]
  const players = new Map<number, number>()
  for (const [num, group] of squadPlan) {
    const created = await payload.create({
      collection: 'players',
      data: {
        slug: `placeholder-player-${num}`,
        firstName: '[First name]',
        surname: '[Surname]',
        squadNumber: num,
        positionGroup: group,
        nationality: '[Country]',
        dateOfBirth: new Date(Date.UTC(1996 + (num % 8), num % 12, 1 + num)).toISOString(),
        heightCm: 170 + ((num * 7) % 25),
        preferredFoot: num % 3 === 0 ? 'left' : 'right',
        joined: new Date(Date.UTC(2024 + (num % 2), 6, 1)).toISOString(),
        previousClub: '[Club name]',
        contractUntil: 2027 + (num % 3),
        status: 'active',
        quote: '[A short quote from the player about the club or the fans.]',
        biography: placeholderBody([
          '[Where the player grew up, how they came through, and the clubs that shaped them.]',
          '[What they bring to the side, their best moments in a Rovers shirt, and what they are working towards.]',
        ]),
        socials: { instagram: 'https://instagram.com', x: 'https://x.com' },
        videos: [
          {
            title: 'Season highlights',
            caption: '[Goals, assists and key moments from the season.]',
          },
          { title: 'In their words', caption: '[A short sit-down interview with the player.]' },
        ],
        career: [
          { season: SEASON, club: 'Ultimate Rovers' },
          { season: '2025/26', club: 'Ultimate Rovers' },
          { season: '[YYYY/YY]', club: '[Previous club]' },
          { season: '[YYYY/YY]', club: '[Previous club]' },
        ],
      },
      overrideAccess: true,
      context: ctx,
    })
    players.set(num, created.id)
  }
  const pid = (num: number) => players.get(num) ?? null

  // Line-ups as drawn: 4-3-3, numbers in the order of the design's pitch.
  const roversXI = [1, 2, 4, 5, 3, 8, 6, 10, 7, 9, 11]
  const roversBench = [13, 14, 15, 16, 17, 18, 19]
  const roversLineup = {
    formation: '4-3-3',
    headCoach: '[Full name]',
    starting: roversXI.map((n) => ({ player: pid(n), number: n })),
    substitutes: roversBench.map((n) => ({ player: pid(n), number: n })),
  }
  const opponentLineup = {
    formation: '4-3-3',
    headCoach: '[Full name]',
    starting: [1, 2, 4, 5, 3, 8, 6, 10, 7, 9, 11].map((n) => ({ name: '[Surname]', number: n })),
    substitutes: [12, 14, 15, 16, 17, 18, 20].map((n) => ({ name: '[Surname]', number: n })),
  }

  const attackers = [9, 11, 7, 10, 8]
  type EventInput = NonNullable<Match['events']>[number]

  /** Goals, a booking or two and two substitutions for a finished match. */
  function eventsFor(
    roversGoals: number,
    oppGoals: number,
    roversSide: 'home' | 'away',
  ): { events: EventInput[]; ht: [number, number] } {
    const oppSide = roversSide === 'home' ? 'away' : 'home'
    const events: EventInput[] = []
    let htRovers = 0
    let htOpp = 0
    for (let g = 0; g < roversGoals; g += 1) {
      const minute = 8 + Math.floor(random() * 80)
      const scorer = pick(attackers)
      const assist = pick(attackers.filter((n) => n !== scorer))
      events.push({
        minute,
        side: roversSide,
        type: 'goal',
        player: pid(scorer),
        relatedPlayer: pid(assist),
      })
      if (minute <= 45) htRovers += 1
    }
    for (let g = 0; g < oppGoals; g += 1) {
      const minute = 10 + Math.floor(random() * 78)
      events.push({
        minute,
        side: oppSide,
        type: 'goal',
        playerName: '[Player name]',
        relatedPlayerName: '[Player name]',
      })
      if (minute <= 45) htOpp += 1
    }
    events.push({
      minute: 20 + Math.floor(random() * 50),
      side: oppSide,
      type: 'yellow',
      playerName: '[Player name]',
      note: 'Foul',
    })
    if (random() > 0.5)
      events.push({
        minute: 50 + Math.floor(random() * 30),
        side: roversSide,
        type: 'yellow',
        player: pid(pick([4, 5, 6, 8])),
      })
    events.push({
      minute: 61,
      side: roversSide,
      type: 'substitution',
      player: pid(14),
      relatedPlayer: pid(8),
    })
    events.push({
      minute: 78,
      side: roversSide,
      type: 'substitution',
      player: pid(17),
      relatedPlayer: pid(11),
    })
    events.sort((a, b) => a.minute - b.minute)
    return { events, ht: [htRovers, htOpp] }
  }

  const randomStats = () => ({
    possession: 40 + Math.floor(random() * 20),
    shots: 6 + Math.floor(random() * 12),
    shotsOnTarget: 2 + Math.floor(random() * 6),
    corners: 2 + Math.floor(random() * 8),
    passesCompleted: 280 + Math.floor(random() * 220),
    fouls: 8 + Math.floor(random() * 8),
    offsides: Math.floor(random() * 5),
  })

  type MatchPlan = {
    kickoff: string
    competition: number
    season?: string
    matchweek?: number
    opponent: number
    roversHome: boolean
    result?: [number, number]
    extra?: Partial<Match>
  }

  const createdMatches: Array<{ id: number; slug: string; kickoff: string; status: string }> = []

  async function createMatch(plan: MatchPlan): Promise<Match> {
    const home = plan.roversHome ? rovers.id : opp(plan.opponent).id
    const away = plan.roversHome ? opp(plan.opponent).id : rovers.id
    const data: Record<string, unknown> = {
      competition: plan.competition,
      season: plan.season ?? SEASON,
      matchweek: plan.matchweek,
      kickoff: plan.kickoff,
      kickoff_tz: TZ,
      homeTeam: home,
      awayTeam: away,
      venue: plan.roversHome ? '[Home ground name]' : '[Opponent ground]',
      referee: '[Referee name]',
      broadcast: '[Channel or stream]',
      status: 'scheduled',
    }
    if (plan.result) {
      const [r, o] = plan.result
      const side = plan.roversHome ? 'home' : 'away'
      const { events, ht } = eventsFor(r, o, side)
      const homeStats = randomStats()
      const awayStats = { ...randomStats(), possession: 100 - homeStats.possession }
      Object.assign(data, {
        status: 'full_time',
        homeScore: plan.roversHome ? r : o,
        awayScore: plan.roversHome ? o : r,
        halfTimeHomeScore: plan.roversHome ? ht[0] : ht[1],
        halfTimeAwayScore: plan.roversHome ? ht[1] : ht[0],
        events,
        lineupsConfirmed: true,
        homeLineup: plan.roversHome ? roversLineup : opponentLineup,
        awayLineup: plan.roversHome ? opponentLineup : roversLineup,
        homeStats,
        awayStats,
        attendance: plan.roversHome ? 1200 + Math.floor(random() * 2400) : null,
      })
    }
    Object.assign(data, plan.extra ?? {})
    const created = await payload.create({
      collection: 'matches',
      data: data as unknown as Match,
      overrideAccess: true,
      context: ctx,
    })
    createdMatches.push({
      id: created.id,
      slug: created.slug ?? '',
      kickoff: created.kickoff,
      status: created.status,
    })
    return created
  }

  // Previous seasons: meetings with the next opponent, for head to head.
  await createMatch({
    kickoff: saturday(new Date(Date.UTC(2025, 9, 1)), 0, 15, 0, TZ),
    competition: pastLeague.id,
    season: '2025/26',
    opponent: 1,
    roversHome: true,
    result: [2, 0],
  })
  await createMatch({
    kickoff: saturday(new Date(Date.UTC(2026, 2, 1)), 0, 15, 0, TZ),
    competition: pastLeague.id,
    season: '2025/26',
    opponent: 1,
    roversHome: false,
    result: [1, 1],
  })
  await createMatch({
    kickoff: saturday(new Date(Date.UTC(2025, 10, 1)), 0, 15, 0, TZ),
    competition: pastLeague.id,
    season: '2025/26',
    opponent: 4,
    roversHome: true,
    result: [0, 2],
  })

  // This season's results, oldest first. The last one is fully written up, as in the full-time design.
  const results: Array<[number, number, boolean, number, [number, number]]> = [
    // weeks before next Saturday, opponent, Rovers at home, competition (0 league, 1 cup), [Rovers, opponent]
    [-8, 11, true, 0, [3, 1]],
    [-7, 10, false, 0, [1, 1]],
    [-6, 9, true, 1, [2, 0]],
    [-5, 7, false, 0, [0, 1]],
    [-4, 6, true, 0, [2, 2]],
    [-3, 5, false, 0, [1, 0]],
    [-2, 3, true, 0, [3, 2]],
  ]
  let matchweek = 4
  for (const [weeks, opponent, home, comp, result] of results) {
    await createMatch({
      kickoff: saturday(now, weeks, 15, 0, TZ),
      competition: comp === 0 ? league.id : cup.id,
      matchweek: comp === 0 ? (matchweek += 1) : undefined,
      opponent,
      roversHome: home,
      result,
    })
  }

  // The featured full-time match: events, stats and report as drawn.
  const highlights = await payload
    .create({
      collection: 'videos',
      data: {
        title: 'Highlights: Ultimate Rovers vs [Opponent FC 8]',
        publishedAt: saturday(now, -1, 18, 0, TZ),
      },
      overrideAccess: true,
      context: ctx,
    })
    .catch(() => null)
  const lastResult = await createMatch({
    kickoff: saturday(now, -1, 15, 0, TZ),
    competition: league.id,
    matchweek: (matchweek += 1),
    opponent: 8,
    roversHome: true,
    extra: {
      status: 'full_time',
      homeScore: 2,
      awayScore: 1,
      halfTimeHomeScore: 1,
      halfTimeAwayScore: 1,
      attendance: 2480,
      lineupsConfirmed: true,
      homeLineup: roversLineup as Match['homeLineup'],
      awayLineup: opponentLineup as Match['awayLineup'],
      events: [
        { minute: 12, side: 'home', type: 'goal', player: pid(9), relatedPlayer: pid(10) },
        { minute: 28, side: 'away', type: 'yellow', playerName: '[Player name]', note: 'Foul' },
        {
          minute: 39,
          side: 'away',
          type: 'goal',
          playerName: '[Player name]',
          relatedPlayerName: '[Player name]',
        },
        { minute: 58, side: 'home', type: 'substitution', player: pid(14), relatedPlayer: pid(8) },
        { minute: 64, side: 'home', type: 'penalty', player: pid(9) },
        { minute: 77, side: 'away', type: 'second_yellow', playerName: '[Player name]' },
        { minute: 85, side: 'home', type: 'substitution', player: pid(17), relatedPlayer: pid(11) },
      ],
      homeStats: {
        possession: 58,
        shots: 15,
        shotsOnTarget: 6,
        corners: 7,
        passesCompleted: 412,
        fouls: 9,
        offsides: 2,
      },
      awayStats: {
        possession: 42,
        shots: 8,
        shotsOnTarget: 3,
        corners: 3,
        passesCompleted: 288,
        fouls: 13,
        offsides: 1,
      },
      playerOfTheMatch: pid(9),
      highlights: highlights?.id ?? null,
      report: {
        headline: '[Headline that sums up the result]',
        standfirst: '[Standfirst: the result and why it matters, in one sentence.]',
        author: '[Author name]',
        body: placeholderBody([
          '[First half: how the game opened and the key moments.]',
          '[Second half: what changed, the decisive goals and the finish.]',
        ]),
        coachQuote: '[What the head coach said after the match.]',
      },
    },
  })
  if (highlights) {
    await payload.update({
      collection: 'videos',
      id: highlights.id,
      data: { relatedMatch: lastResult.id },
      overrideAccess: true,
      context: ctx,
    })
  }

  // Optional live match, for trying the live state locally: `pnpm seed:reset live`.
  if (live) {
    await createMatch({
      kickoff: new Date(now.getTime() - 67 * 60_000).toISOString(),
      competition: cup.id,
      opponent: 9,
      roversHome: true,
      extra: {
        status: 'live',
        minute: 67,
        homeScore: 2,
        awayScore: 1,
        halfTimeHomeScore: 1,
        halfTimeAwayScore: 1,
        lineupsConfirmed: true,
        homeLineup: roversLineup as Match['homeLineup'],
        awayLineup: opponentLineup as Match['awayLineup'],
        events: [
          { minute: 12, side: 'home', type: 'goal', player: pid(9), relatedPlayer: pid(10) },
          { minute: 28, side: 'away', type: 'yellow', playerName: '[Player name]', note: 'Foul' },
          {
            minute: 39,
            side: 'away',
            type: 'goal',
            playerName: '[Player name]',
            relatedPlayerName: '[Player name]',
          },
          {
            minute: 58,
            side: 'home',
            type: 'substitution',
            player: pid(14),
            relatedPlayer: pid(8),
          },
          { minute: 64, side: 'home', type: 'penalty', player: pid(9) },
        ],
        homeStats: {
          possession: 55,
          shots: 11,
          shotsOnTarget: 5,
          corners: 5,
          passesCompleted: 301,
          fouls: 7,
          offsides: 1,
        },
        awayStats: {
          possession: 45,
          shots: 6,
          shotsOnTarget: 2,
          corners: 2,
          passesCompleted: 240,
          fouls: 10,
          offsides: 2,
        },
        watchUrl: 'https://example.com/live',
      },
    })
  }

  // Fixtures. The first is the next match: preview, team news, predicted line-ups, tickets on sale.
  const nextMatch = await createMatch({
    kickoff: saturday(now, 0, 15, 0, TZ),
    competition: league.id,
    matchweek: (matchweek += 1),
    opponent: 1,
    roversHome: true,
    extra: {
      ticketAvailability: 'on_sale',
      ticketUrl: 'https://tickets.example.com/',
      ticketInfo: 'Adults from [Price], under-16s from [Price]. Members get priority until [Date].',
      preview:
        '[Where both sides stand going into the game, what is at stake and the key battles to watch.]',
      homeTeamNews: [
        { text: '[Player name]: [injury or suspension]' },
        { text: '[Player name]: [doubtful, late fitness test]' },
      ],
      awayTeamNews: [
        { text: '[Player name]: [injury or suspension]' },
        { text: '[Player name]: [returns from injury]' },
      ],
      lineupsConfirmed: false,
      homeLineup: roversLineup as Match['homeLineup'],
      awayLineup: opponentLineup as Match['awayLineup'],
    },
  })
  await createMatch({
    kickoff: saturday(now, 0, 19, 45, TZ, 4),
    competition: cup.id,
    opponent: 2,
    roversHome: false,
    extra: {
      status: 'postponed',
      statusNote: '[Reason for the postponement. New date to be confirmed.]',
    },
  })
  const fixtures: Array<[number, number, number, boolean, number, number, number]> = [
    // weeks, day shift from Saturday, opponent, home, competition (0 league, 2 friendly), hour, minute
    [1, 1, 3, false, 0, 13, 30],
    [2, 0, 4, true, 0, 15, 0],
    [3, 3, 5, true, 2, 19, 45],
    [3, 0, 6, false, 0, 15, 0],
    [4, 0, 7, true, 0, 15, 0],
    [5, 0, 2, false, 0, 12, 30],
  ]
  for (const [weeks, shift, opponent, home, comp, hour, minute] of fixtures) {
    await createMatch({
      kickoff: saturday(now, weeks, hour, minute, TZ, shift),
      competition: comp === 0 ? league.id : friendly.id,
      matchweek: comp === 0 ? (matchweek += 1) : undefined,
      opponent,
      roversHome: home,
      extra: home
        ? { ticketAvailability: 'on_sale', ticketUrl: 'https://tickets.example.com/' }
        : {},
    })
  }

  // Videos for Watch on Home.
  for (const [title, hoursAgo] of [
    ['Head coach press conference', 30],
    ['Training: inside the week', 60],
  ] as const) {
    await payload.create({
      collection: 'videos',
      data: { title, publishedAt: new Date(now.getTime() - hoursAgo * 3_600_000).toISOString() },
      overrideAccess: true,
      context: ctx,
    })
  }

  // Articles, as listed in News.dc.html, plus the Home lead story.
  const articlePlan: Array<{
    title: string
    category: 'match-report' | 'match-preview' | 'squad-news' | 'club' | 'academy' | 'community'
    daysAgo: number
    featured?: boolean
    relatedMatch?: number
  }> = [
    {
      title: 'Ultimate Rovers vs [Opponent FC 1]: everything you need before kick-off',
      category: 'match-preview',
      daysAgo: 1,
      featured: true,
      relatedMatch: nextMatch.id,
    },
    {
      title: 'Ultimate Rovers X : X [Opponent FC 8]: how the match was won',
      category: 'match-report',
      daysAgo: 2,
      relatedMatch: lastResult.id,
    },
    { title: 'Team news ahead of the [Competition] fixture', category: 'squad-news', daysAgo: 3 },
    {
      title: 'Open trials for the [Age group] squad return on [Date]',
      category: 'academy',
      daysAgo: 4,
    },
    {
      title: 'Rovers players visit [School or community group]',
      category: 'community',
      daysAgo: 5,
    },
    {
      title: '[Player name] signs a new contract until [YYYY]',
      category: 'squad-news',
      daysAgo: 6,
    },
    { title: 'Season ticket renewals open for [2026/27]', category: 'club', daysAgo: 8 },
    {
      title: 'Ultimate Rovers X : X [Opponent FC 3]: the talking points',
      category: 'match-report',
      daysAgo: 9,
    },
    {
      title: 'Injury update ahead of the [Competition] fixture',
      category: 'squad-news',
      daysAgo: 11,
    },
    {
      title: '[Opponent FC 5] X : X Ultimate Rovers: the head coach’s verdict',
      category: 'match-report',
      daysAgo: 13,
    },
    { title: 'Welcoming [Partner name] as an official partner', category: 'club', daysAgo: 16 },
    {
      title: 'Coaching clinic returns to [Venue] this [Month]',
      category: 'community',
      daysAgo: 20,
    },
  ]
  for (const a of articlePlan) {
    await payload.create({
      collection: 'articles',
      data: {
        title: a.title,
        category: a.category,
        featured: Boolean(a.featured),
        author: '[Author name]',
        standfirst: '[One or two sentences that set up the story and make people want to read on.]',
        publishedAt: new Date(now.getTime() - a.daysAgo * 86_400_000).toISOString(),
        relatedMatch: a.relatedMatch,
        body: placeholderBody([
          '[Opening paragraph: the news in one or two sentences.]',
          '[Second paragraph: the detail, the people involved and why it matters to supporters.]',
          { h2: '[Subheading]' },
          '[Further detail, background or what happens next.]',
          { quote: '[A quote from someone at the club.]' },
          '[Closing paragraph with dates, links or how to get involved.]',
        ]),
        _status: 'published',
      },
      overrideAccess: true,
      context: ctx,
    })
  }

  // People, by group, roles as drawn in Stakeholders.dc.html.
  const peoplePlan: Record<'board' | 'management' | 'technical' | 'investors', string[]> = {
    board: [
      'Chairman',
      'Vice chairman',
      'Director of finance',
      'Non-executive director',
      'Club secretary',
    ],
    management: [
      'General manager',
      'Team manager',
      'Head of operations',
      'Head of media',
      'Head of commercial',
      'Supporter liaison officer',
    ],
    technical: [
      'Head coach',
      'Assistant coach',
      'Goalkeeper coach',
      'Strength and conditioning coach',
      'Performance analyst',
      'Team doctor',
      'Physiotherapist',
      'Kit manager',
    ],
    investors: ['Principal investor', 'Shareholder', 'Shareholder', 'Club patron'],
  }
  for (const [group, roles] of Object.entries(peoplePlan) as Array<
    [keyof typeof peoplePlan, string[]]
  >) {
    let order = 0
    for (const role of roles) {
      await payload.create({
        collection: 'people',
        data: { name: '[Full name]', role, group, order: (order += 1) },
        overrideAccess: true,
        context: ctx,
      })
    }
  }

  // Partners.
  const partnerPlan: Array<
    [string, 'principal' | 'official' | 'supplier' | 'community', string | null]
  > = [
    [
      '[Principal partner]',
      'principal',
      '[One line on the partnership, for example front-of-shirt sponsor since YYYY.]',
    ],
    ['[Kit partner]', 'official', null],
    ['[Official partner]', 'official', null],
    ['[Official partner]', 'official', null],
    ['[Official partner]', 'official', null],
    ['[Supplier]', 'supplier', null],
    ['[Supplier]', 'supplier', null],
    ['[Supplier]', 'supplier', null],
    ['[Supplier]', 'supplier', null],
    ['[Community partner]', 'community', null],
    ['[Community partner]', 'community', null],
    ['[Community partner]', 'community', null],
  ]
  let partnerOrder = 0
  for (const [name, tier, blurb] of partnerPlan) {
    partnerOrder += 1
    await payload.create({
      collection: 'partners',
      data: {
        name,
        tier,
        blurb,
        url: 'https://example.com',
        // Home shows the principal, kit, two official and one community partner, as drawn.
        showOnHome: [1, 2, 3, 4, 10].includes(partnerOrder),
        order: partnerOrder,
      },
      overrideAccess: true,
      context: ctx,
    })
  }

  // Honours and timeline.
  for (const [i, competition] of [
    '[League title]',
    '[Cup competition]',
    '[Regional cup]',
    '[Youth honour]',
  ].entries()) {
    await payload.create({
      collection: 'honours',
      data: { competition, count: 0, years: '[YYYY], [YYYY]', order: i },
      overrideAccess: true,
      context: ctx,
    })
  }
  for (const [i, [year, title]] of [
    ['[YYYY]', 'The club is founded'],
    ['[YYYY]', 'First competitive season'],
    ['[YYYY]', 'Move to [Home ground name]'],
    ['[YYYY]', '[First trophy or promotion]'],
    ['2026', '[Where the club is today]'],
  ].entries()) {
    await payload.create({
      collection: 'timeline-entries',
      data: { year: year!, title: title!, text: '[A sentence or two on what happened.]', order: i },
      overrideAccess: true,
      context: ctx,
    })
  }

  // Governance documents.
  for (const [i, title] of [
    'Club constitution',
    'Annual report [YYYY]',
    'Safeguarding policy',
    'Supporter charter',
  ].entries()) {
    const data = placeholderPdf(title)
    await payload.create({
      collection: 'documents',
      data: { title, order: i },
      file: {
        data,
        mimetype: 'application/pdf',
        name: `placeholder-${i + 1}.pdf`,
        size: data.length,
      },
      overrideAccess: true,
      context: ctx,
    })
  }

  // Club settings.
  const legal = (name: string) =>
    richText([
      `[This ${name} is placeholder text. Replace it with the club's own wording before launch.]`,
      { h2: '[Who we are]' },
      '[The club, its registered address and how to contact the person responsible for this policy.]',
      { h2: '[What this covers]' },
      '[What the policy applies to, what we collect or expect, and why.]',
      { h2: '[Your rights and choices]' },
      '[How to ask questions, make a request or complain.]',
    ])
  await payload.updateGlobal({
    slug: 'club-settings',
    data: {
      clubName: 'Ultimate Rovers',
      founded: '[YYYY]',
      currentSeason: SEASON,
      city: '[City]',
      country: '[Country]',
      timezone: TZ,
      shortBio: '[Short line about the club, its home and the community it plays for.]',
      ticketsUrl: '',
      broadcastPartner: '[Broadcaster]',
      ground: {
        name: '[Home ground name]',
        street: '[Street address]',
        city: '[City]',
        surface: '[Grass or artificial]',
        accessibleEntry: '[Gate name or number]',
        mapUrl: 'https://maps.google.com',
        guide: '[Home ground name], [Street address]. Parking, transport and accessible entry.',
      },
      phone: '[+000 000 000 0000]',
      replyDays: 2,
      officeHours: 'Mon to Fri, [09:00] to [17:00]',
      matchdayHours: 'Matchdays, from [3] hours before kick-off',
      departments: [
        {
          topic: 'general',
          title: 'General enquiries',
          text: 'Questions about the club, visits and everything else.',
          email: 'hello@example.com',
          showCard: true,
        },
        {
          topic: 'tickets',
          title: 'Tickets and membership',
          text: 'Matchday tickets, season tickets and member services.',
          email: 'tickets@example.com',
          showCard: true,
        },
        {
          topic: 'partnerships',
          title: 'Partnerships',
          text: 'Sponsorship, advertising and commercial packages.',
          email: 'partners@example.com',
          showCard: true,
        },
        {
          topic: 'media',
          title: 'Media and press',
          text: 'Interview requests, accreditation and press releases.',
          email: 'media@example.com',
          showCard: true,
        },
        {
          topic: 'academy',
          title: 'Trials and academy',
          text: 'Trials, age groups and the academy pathway.',
          email: 'academy@example.com',
          showCard: false,
        },
      ],
      faqs: [
        {
          question: 'How do I buy match tickets?',
          answer:
            'Home tickets go on sale [X] days before each match on the Fixtures page and at the ground. Members get priority access.',
        },
        {
          question: 'How can my child attend academy trials?',
          answer:
            'Trials for [U-##] to [U-##] run in [Month]. Send a message with the topic Trials and academy and we will send the dates.',
        },
        {
          question: 'How do we become a club partner?',
          answer:
            'Email our commercial team with your organisation and goals, and we will share the partnership packages for the season.',
        },
        {
          question: 'Can we request a player appearance?',
          answer:
            'Yes, for schools, charities and community events. Send the date, venue and audience at least [4] weeks ahead.',
        },
        {
          question: 'I am a journalist. How do I get accreditation?',
          answer:
            'Contact the media team with your outlet and the fixture at least [48] hours before kick-off.',
        },
      ],
      socials: {
        instagram: 'https://instagram.com',
        x: 'https://x.com',
        youtube: 'https://youtube.com',
        tiktok: 'https://tiktok.com',
        facebook: 'https://facebook.com',
      },
      heroIntro: 'Fixtures, results, the squad and every story from the club, in one place.',
      spotlight: [1, 4, 8, 9].map((n) => pid(n)).filter((id): id is number => id !== null),
      crestStory:
        'Our crest carries a triskele at the heart of the ball and a balance mark beneath the name. [Tell the story of where the club came from and what those symbols stand for.]',
      aboutIntro:
        'Founded in [YYYY] in [City], Ultimate Rovers plays for [the community the club represents]. [One more sentence on what the club is about.]',
      story: [
        { paragraph: '[How the club began, who started it and why.]' },
        { paragraph: '[The moments that shaped the club and where it is heading.]' },
      ],
      crestElements: [
        {
          title: 'The ball',
          text: 'Football sits at the top of the shield, above everything else. [Add the club’s meaning.]',
        },
        {
          title: 'The triskele',
          text: 'Three spirals turning together at the centre of the ball. [Add the club’s meaning.]',
        },
        {
          title: 'The shield',
          text: 'Navy and cyan, the club colours, framing the name. [Add the club’s meaning.]',
        },
        {
          title: 'The balance mark',
          text: 'A yin and yang symbol beneath the name. [Add the club’s meaning.]',
        },
      ],
      mission: '[What the club does every day, in one sentence.]',
      vision: '[Where the club wants to be in five to ten years.]',
      values: '[Value one], [value two], [value three].',
      academyText: 'Age groups from [U-##] to [U-##]. Trials run in [Month].',
      communityText: '[School visits, coaching clinics and the programmes the club runs.]',
      membershipText: 'Priority tickets, member events and a vote at the annual general meeting.',
      seasonTicketText: 'Every home league match, priority for cup games. From [Price].',
      matchdayTicketText:
        'On sale [X] days before each home game, online and at the ground. From [Price].',
      matchTicketText:
        'Adults from [Price], under-16s from [Price]. Members get priority until [Date].',
      partnershipText:
        'Shirt, stadium, digital and community packages are open for the [2026/27] season.',
      privacy: legal('privacy policy'),
      terms: legal('terms of use'),
      cookies: richText([
        'This site only sets cookies that it needs to work, such as keeping staff signed in to the club admin. It sets no advertising or tracking cookies, so there is nothing to opt out of.',
        { h2: '[Cookies we use]' },
        '[List each essential cookie, what it does and how long it lasts.]',
        { h2: 'Embedded videos' },
        'Videos from YouTube or Vimeo only load after you press play. Those services may then set their own cookies.',
      ]),
    },
    overrideAccess: true,
    context: ctx,
  })

  payload.logger.info(
    `Seed complete: ${createdMatches.length} matches, ${players.size} players, ${articlePlan.length} articles. Every entry is placeholder content.`,
  )
  return true
}
