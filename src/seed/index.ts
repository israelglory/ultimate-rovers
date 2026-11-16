import path from 'node:path'

import type { CollectionSlug, Payload } from 'payload'

import type { Match } from '@/payload-types'

import {
  type ArticleCategory,
  BIG_GAME_GROUND,
  BROADCAST,
  CITY,
  HEAD_COACH,
  HOME_GROUND,
  honours,
  opponentFirstNames,
  opponents,
  opponentSurnames,
  partners,
  people,
  playerQuotes,
  positionsByGroup,
  previousClubs,
  referees,
  squad,
  timeline,
} from './content'
import { type Block, richText } from './lexical'
import { placeholderPdf } from './pdf'
import { saturday } from './time'

/**
 * Starter content so every page renders on a fresh install. The squad comes from the club's team
 * list; everything else in ./content.ts and below is realistic sample content to replace in the admin.
 */

const ctx = { disableRevalidate: true, skipVideoValidation: true }
const TZ = 'Africa/Lagos'
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

/** Specific positions for the usual starting eleven; everyone else cycles through their group. */
const startingPositions: Record<number, string> = {
  1: 'Goalkeeper',
  2: 'Right-back',
  3: 'Left-back',
  5: 'Centre-back',
  6: 'Centre-back',
  4: 'Defensive midfielder',
  8: 'Central midfielder',
  10: 'Attacking midfielder',
  7: 'Winger',
  11: 'Winger',
  9: 'Striker',
}

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
  const between = (min: number, max: number) => min + Math.floor(random() * (max - min + 1))
  const opponentName = () => `${pick(opponentFirstNames)} ${pick(opponentSurnames)}`

  // Media: the crest.
  const crest = await payload.create({
    collection: 'media',
    data: { alt: 'Ultimate Rovers crest' },
    filePath: path.resolve(process.cwd(), 'public/crest.png'),
    overrideAccess: true,
    context: ctx,
  })

  // Team photo: stand-in news image until the club uploads photos for each story.
  const teamPhoto = await payload.create({
    collection: 'media',
    data: {
      alt: 'Ultimate Rovers players in navy and pink kit lined up for a team photo on a grass pitch',
      credit: 'Ultimate Rovers',
    },
    filePath: path.join(process.cwd(), 'src/seed/images', 'team-photo.jpg'),
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
      homeGround: HOME_GROUND,
    },
    overrideAccess: true,
    context: ctx,
  })
  const opponentDocs: Array<{ id: number; name: string }> = []
  for (const o of opponents) {
    opponentDocs.push(
      await payload.create({
        collection: 'teams',
        data: { name: o.name, shortName: o.shortName, homeGround: o.ground },
        overrideAccess: true,
        context: ctx,
      }),
    )
  }
  const opp = (n: number) => opponentDocs[n - 1]!

  // Competitions.
  const standingsRows: Array<[number, number, number, number, number, number, string]> = [
    // team (0 = Rovers, otherwise opponent number), W, D, L, GF, GA, form
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
      name: 'Oyo State League',
      shortName: 'State League',
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
    data: { name: 'Oyo State FA Cup', shortName: 'State Cup', type: 'cup', season: SEASON },
    overrideAccess: true,
    context: ctx,
  })
  const friendly = await payload.create({
    collection: 'competitions',
    data: { name: 'Pre-season friendly', shortName: 'Friendly', type: 'friendly', season: SEASON },
    overrideAccess: true,
    context: ctx,
  })
  const pastLeague = await payload.create({
    collection: 'competitions',
    data: {
      name: 'Oyo State League',
      shortName: 'State League',
      type: 'league',
      season: '2025/26',
    },
    overrideAccess: true,
    context: ctx,
  })

  // Players from the club's team list, with sample details.
  const players = new Map<number, number>()
  const groupCounters: Record<string, number> = {}
  for (const [num, firstName, surname, group] of squad) {
    const index = (groupCounters[group] = (groupCounters[group] ?? 0) + 1)
    const position =
      startingPositions[num] ?? positionsByGroup[group][index % positionsByGroup[group].length]!
    const joinedYear = random() > 0.5 ? 2024 : 2025
    const previousClub = pick(previousClubs)
    const heightRange: Record<typeof group, [number, number]> = {
      goalkeeper: [185, 193],
      defender: [176, 190],
      midfielder: [168, 182],
      forward: [170, 186],
    }
    const firstWord = firstName.split(' ')[0] ?? firstName
    const career = [
      { season: SEASON, club: 'Ultimate Rovers' },
      { season: '2025/26', club: 'Ultimate Rovers' },
      ...(joinedYear === 2024
        ? [{ season: '2024/25', club: 'Ultimate Rovers' }]
        : [
            {
              season: '2024/25',
              club: previousClub,
              apps: between(12, 26),
              goals: between(0, 9),
              assists: between(0, 6),
            },
          ]),
      {
        season: '2023/24',
        club: previousClub,
        apps: between(10, 24),
        goals: between(0, 8),
        assists: between(0, 5),
      },
    ]
    const created = await payload.create({
      collection: 'players',
      data: {
        firstName,
        surname,
        squadNumber: num,
        positionGroup: group,
        position,
        nationality: 'Nigeria',
        dateOfBirth: new Date(
          Date.UTC(between(1997, 2007), between(0, 11), between(1, 28)),
        ).toISOString(),
        heightCm: between(...heightRange[group]),
        preferredFoot: random() > 0.78 ? 'left' : random() > 0.95 ? 'both' : 'right',
        joined: new Date(Date.UTC(joinedYear, 6, 1)).toISOString(),
        previousClub,
        contractUntil: between(2027, 2029),
        status: 'active',
        quote: pick(playerQuotes),
        biography: richText([
          `${firstWord} grew up playing street football in ${CITY} before developing at ${previousClub}, where coaches first noticed the work rate and composure that now define a ${position.toLowerCase()} in a Rovers shirt.`,
          `Since joining Ultimate Rovers in ${joinedYear}, ${firstWord} has become a familiar face at ${HOME_GROUND}, trusted by the coaching staff and popular with supporters for never giving up on a ball.`,
        ]),
        socials: { instagram: 'https://instagram.com', x: 'https://x.com' },
        videos: [
          {
            title: 'Season highlights',
            caption: 'Goals, assists and key moments from the season.',
          },
          { title: 'In their words', caption: `A short sit-down interview with ${firstWord}.` },
        ],
        career,
      },
      overrideAccess: true,
      context: ctx,
    })
    players.set(num, created.id)
  }
  const pid = (num: number) => players.get(num) ?? null

  // Line-ups: 4-3-3. Goalkeeper, then each line from the left as the team attacks.
  const roversXI = [1, 3, 5, 6, 2, 8, 4, 10, 7, 9, 11]
  const roversBench = [21, 14, 20, 17, 19, 28, 12]
  const roversLineup = {
    formation: '4-3-3',
    headCoach: HEAD_COACH,
    starting: roversXI.map((n) => ({ player: pid(n), number: n })),
    substitutes: roversBench.map((n) => ({ player: pid(n), number: n })),
  }
  const opponentLineup = () => ({
    formation: pick(['4-3-3', '4-4-2', '4-2-3-1']),
    headCoach: opponentName(),
    starting: [1, 2, 4, 5, 3, 8, 6, 10, 7, 9, 11].map((n, i) => ({
      name: opponentSurnames[i % opponentSurnames.length],
      number: n,
    })),
    substitutes: [12, 14, 15, 16, 17, 18, 20].map((n, i) => ({
      name: opponentSurnames[(i + 11) % opponentSurnames.length],
      number: n,
    })),
  })

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
        playerName: opponentName(),
        relatedPlayerName: opponentName(),
      })
      if (minute <= 45) htOpp += 1
    }
    events.push({
      minute: 20 + Math.floor(random() * 50),
      side: oppSide,
      type: 'yellow',
      playerName: opponentName(),
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
    /** Big home games move from the school pitch to Soun Stadium. */
    atSoun?: boolean
    result?: [number, number]
    extra?: Partial<Match>
  }

  let matchCount = 0

  async function createMatch(plan: MatchPlan): Promise<Match> {
    const opponent = opponents[plan.opponent - 1]!
    const data: Record<string, unknown> = {
      competition: plan.competition,
      season: plan.season ?? SEASON,
      matchweek: plan.matchweek,
      kickoff: plan.kickoff,
      kickoff_tz: TZ,
      homeTeam: plan.roversHome ? rovers.id : opp(plan.opponent).id,
      awayTeam: plan.roversHome ? opp(plan.opponent).id : rovers.id,
      venue: plan.roversHome ? (plan.atSoun ? BIG_GAME_GROUND : HOME_GROUND) : opponent.ground,
      referee: pick(referees),
      broadcast: BROADCAST,
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
        homeLineup: plan.roversHome ? roversLineup : opponentLineup(),
        awayLineup: plan.roversHome ? opponentLineup() : roversLineup,
        homeStats,
        awayStats,
        attendance: plan.roversHome
          ? plan.atSoun
            ? between(4000, 9000)
            : between(600, 1800)
          : null,
      })
    }
    Object.assign(data, plan.extra ?? {})
    matchCount += 1
    return payload.create({
      collection: 'matches',
      data: data as unknown as Match,
      overrideAccess: true,
      context: ctx,
    })
  }

  // Previous season: meetings with the next opponent, for head to head.
  await createMatch({
    kickoff: saturday(new Date(Date.UTC(2025, 9, 1)), 0, 16, 0, TZ),
    competition: pastLeague.id,
    season: '2025/26',
    opponent: 1,
    roversHome: true,
    atSoun: true,
    result: [2, 0],
  })
  await createMatch({
    kickoff: saturday(new Date(Date.UTC(2026, 2, 1)), 0, 16, 0, TZ),
    competition: pastLeague.id,
    season: '2025/26',
    opponent: 1,
    roversHome: false,
    result: [1, 1],
  })
  await createMatch({
    kickoff: saturday(new Date(Date.UTC(2025, 10, 1)), 0, 16, 0, TZ),
    competition: pastLeague.id,
    season: '2025/26',
    opponent: 4,
    roversHome: true,
    result: [0, 2],
  })

  // This season's results, oldest first.
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
      kickoff: saturday(now, weeks, 16, 0, TZ),
      competition: comp === 0 ? league.id : cup.id,
      matchweek: comp === 0 ? (matchweek += 1) : undefined,
      opponent,
      roversHome: home,
      atSoun: comp === 1,
      result,
    })
  }

  // The latest result, fully written up.
  const highlights = await payload.create({
    collection: 'videos',
    data: {
      title: 'Highlights: Ultimate Rovers 2 : 1 Eruwa Lions',
      publishedAt: saturday(now, -1, 19, 0, TZ),
    },
    overrideAccess: true,
    context: ctx,
  })
  const eruwaPlayer = (i: number) => `${opponentFirstNames[i]} ${opponentSurnames[i]}`
  const lastResult = await createMatch({
    kickoff: saturday(now, -1, 16, 0, TZ),
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
      attendance: 1450,
      lineupsConfirmed: true,
      homeLineup: roversLineup as Match['homeLineup'],
      awayLineup: opponentLineup() as Match['awayLineup'],
      events: [
        {
          minute: 12,
          side: 'home',
          type: 'goal',
          player: pid(9),
          relatedPlayer: pid(10),
          note: 'Header',
        },
        { minute: 28, side: 'away', type: 'yellow', playerName: eruwaPlayer(2), note: 'Foul' },
        {
          minute: 39,
          side: 'away',
          type: 'goal',
          playerName: eruwaPlayer(4),
          relatedPlayerName: eruwaPlayer(6),
        },
        { minute: 58, side: 'home', type: 'substitution', player: pid(14), relatedPlayer: pid(8) },
        { minute: 64, side: 'home', type: 'penalty', player: pid(9) },
        { minute: 77, side: 'away', type: 'second_yellow', playerName: eruwaPlayer(2) },
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
      highlights: highlights.id,
      report: {
        headline: 'Aderogba double sinks Eruwa Lions',
        standfirst:
          'Loving Aderogba scored in each half as Ultimate Rovers came from level at the break to keep pace at the top of the Oyo State League.',
        author: 'Victor Okonkwo',
        body: richText([
          'Rovers started on the front foot at Nurudeen Grammar School and took the lead after twelve minutes, Aderogba rising above his marker to head in Olashile Awere’s cross from the right.',
          'Eruwa Lions grew into the game and levelled six minutes before the break with a low finish after a quick counter-attack, the first goal Rovers had conceded at home in a month.',
          { h2: 'Second half' },
          'Head coach Babatunde Oyewole sent on Clement Bolaji for more control in midfield and the change paid off. On 64 minutes Aderogba was brought down in the box and sent the goalkeeper the wrong way from the spot.',
          'Eruwa finished with ten men after a second booking, and Rovers saw the game out comfortably to make it three home wins in a row.',
        ]),
        coachQuote:
          'We stayed patient when it got difficult. The supporters carried us in the second half and the boys deserved the three points.',
      },
    },
  })
  await payload.update({
    collection: 'videos',
    id: highlights.id,
    data: { relatedMatch: lastResult.id },
    overrideAccess: true,
    context: ctx,
  })

  // Optional live match, for trying the live state locally: `pnpm seed:reset live`.
  if (live) {
    await createMatch({
      kickoff: new Date(now.getTime() - 67 * 60_000).toISOString(),
      competition: cup.id,
      opponent: 9,
      roversHome: true,
      atSoun: true,
      extra: {
        status: 'live',
        minute: 67,
        homeScore: 2,
        awayScore: 1,
        halfTimeHomeScore: 1,
        halfTimeAwayScore: 1,
        lineupsConfirmed: true,
        homeLineup: roversLineup as Match['homeLineup'],
        awayLineup: opponentLineup() as Match['awayLineup'],
        events: [
          { minute: 12, side: 'home', type: 'goal', player: pid(9), relatedPlayer: pid(10) },
          { minute: 28, side: 'away', type: 'yellow', playerName: opponentName(), note: 'Foul' },
          {
            minute: 39,
            side: 'away',
            type: 'goal',
            playerName: opponentName(),
            relatedPlayerName: opponentName(),
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
        watchUrl: 'https://youtube.com',
      },
    })
  }

  // Fixtures. The next match is the derby against Oyo Royals, moved to Soun Stadium.
  const nextMatch = await createMatch({
    kickoff: saturday(now, 0, 16, 0, TZ),
    competition: league.id,
    matchweek: (matchweek += 1),
    opponent: 1,
    roversHome: true,
    atSoun: true,
    extra: {
      ticketAvailability: 'on_sale',
      ticketUrl: 'https://tickets.example.com/',
      ticketInfo:
        'Regular ₦1,000, covered stand ₦2,500, under-16s ₦500. Members get priority until Thursday.',
      preview:
        'Third host fourth as Ultimate Rovers welcome Oyo Royals to Soun Stadium. Rovers have won three in a row and know victory would open a five-point gap over their neighbours. Expect a battle in midfield between Azeez Mascherano and the Royals captain.',
      homeTeamNews: [
        { text: 'Goodness Akinloye: back in training after a hamstring strain' },
        { text: 'Sunday Olabanjo: doubtful, late fitness test on Friday' },
      ],
      awayTeamNews: [
        { text: `${opponentName()}: suspended after five bookings` },
        { text: `${opponentName()}: returns from a knee injury` },
      ],
      lineupsConfirmed: false,
      homeLineup: roversLineup as Match['homeLineup'],
      awayLineup: opponentLineup() as Match['awayLineup'],
    },
  })
  await createMatch({
    kickoff: saturday(now, 0, 16, 0, TZ, 4),
    competition: cup.id,
    opponent: 2,
    roversHome: false,
    extra: {
      status: 'postponed',
      statusNote: 'Postponed because of a waterlogged pitch. The new date will be announced soon.',
    },
  })
  const fixtures: Array<[number, number, number, boolean, number, number, number]> = [
    // weeks, day shift from Saturday, opponent, Rovers at home, competition (0 league, 2 friendly), hour, minute
    [1, 1, 3, false, 0, 16, 0],
    [2, 0, 4, true, 0, 16, 0],
    [3, 3, 5, true, 2, 16, 30],
    [3, 0, 6, false, 0, 16, 0],
    [4, 0, 7, true, 0, 16, 0],
    [5, 0, 2, false, 0, 15, 30],
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
    ['Head coach press conference: Oyo Royals derby', 30],
    ['Training: inside the week at Nurudeen Grammar School', 60],
  ] as const) {
    await payload.create({
      collection: 'videos',
      data: { title, publishedAt: new Date(now.getTime() - hoursAgo * 3_600_000).toISOString() },
      overrideAccess: true,
      context: ctx,
    })
  }

  // Articles.
  const articlePlan: Array<{
    title: string
    category: ArticleCategory
    daysAgo: number
    standfirst: string
    body: Block[]
    author?: string
    featured?: boolean
    relatedMatch?: number
  }> = [
    {
      title:
        'Ultimate Rovers vs Oyo Royals: everything you need before Saturday’s derby at Soun Stadium',
      category: 'match-preview',
      daysAgo: 1,
      featured: true,
      relatedMatch: nextMatch.id,
      standfirst:
        'Kick-off time, tickets, team news and the key battles as third meets fourth in front of what should be the biggest crowd of the season.',
      body: [
        'Saturday’s derby moves from Nurudeen Grammar School to Soun Stadium to make room for the expected crowd. Gates open two hours before kick-off.',
        'Rovers go into the game on a run of three straight wins, with Loving Aderogba scoring in each of the last two matches.',
        { h2: 'Team news' },
        'Goodness Akinloye is back in training after a hamstring strain. Sunday Olabanjo faces a late fitness test.',
        { quote: 'Derbies are about nerve. We have to stay calm and play our football.' },
        'Tickets are on sale online and at the club office until Friday evening, while stocks last.',
      ],
    },
    {
      title: 'Ultimate Rovers 2 : 1 Eruwa Lions: Aderogba double settles it',
      category: 'match-report',
      daysAgo: 2,
      relatedMatch: lastResult.id,
      standfirst:
        'Loving Aderogba scored in each half as Rovers came from level at the break to make it three home wins in a row.',
      body: [
        'Aderogba headed Rovers in front early before Eruwa Lions equalised on the counter.',
        'A second-half penalty from the same player decided a hard-fought game at Nurudeen Grammar School.',
      ],
    },
    {
      title: 'Team news: Akinloye back in contention for the derby',
      category: 'squad-news',
      daysAgo: 3,
      standfirst:
        'The midfielder has returned to full training and could feature against Oyo Royals on Saturday.',
      body: [
        'Goodness Akinloye has trained fully all week after a hamstring strain kept him out for three matches.',
        'The medical team will make a final decision after Friday’s session.',
      ],
    },
    {
      title: 'Academy trials for under-15s and under-17s return in December',
      category: 'academy',
      daysAgo: 4,
      standfirst:
        'Young players from Ogbomoso and nearby towns can register now for two days of trials at Nurudeen Grammar School.',
      body: [
        'Trials run over two Saturdays in December. Players should bring boots, shin pads and a parent or guardian.',
        'Register through the Contact page with the topic Trials and academy.',
      ],
    },
    {
      title: 'Rovers players visit pupils at Nurudeen Grammar School',
      category: 'community',
      daysAgo: 5,
      standfirst:
        'Members of the first team spent the afternoon coaching pupils and talking about staying in school.',
      body: [
        'Afeez Badmus, Azeez Mascherano and Glory Olaifa led a coaching session for more than a hundred pupils.',
        'The visit is part of the club’s schools programme across Ogbomoso.',
      ],
    },
    {
      title: 'Afeez Badmus signs a new contract until 2028',
      category: 'squad-news',
      daysAgo: 6,
      standfirst: 'The club’s number one has committed his future to Ultimate Rovers.',
      body: [
        'Badmus has kept eight clean sheets this season and becomes the latest player to extend his stay.',
        'He said he wants to win the league again in front of the Ogbomoso supporters.',
      ],
    },
    {
      title: 'Season ticket renewals open for 2026/27',
      category: 'club',
      daysAgo: 8,
      standfirst:
        'Supporters can renew their seats for every home league match, with priority for cup games.',
      body: [
        'Season tickets cost ₦15,000 for adults and ₦7,500 for under-16s.',
        'Renew at the club office or online before the end of the month to keep your seat.',
      ],
    },
    {
      title: 'Ultimate Rovers 3 : 2 Saki United: five talking points',
      category: 'match-report',
      daysAgo: 9,
      standfirst:
        'A five-goal thriller at Nurudeen Grammar School and plenty to discuss afterwards.',
      body: [
        'Rovers twice came from behind before a late winner sealed the points.',
        'The result moved the club into the top three of the Oyo State League.',
      ],
    },
    {
      title: 'Injury update: Olabanjo steps up his recovery',
      category: 'squad-news',
      daysAgo: 11,
      standfirst:
        'The forward is back on the grass and working towards a return before the end of the month.',
      body: [
        'Sunday Olabanjo has started running drills after an ankle injury.',
        'The medical team expects him to rejoin full training next week.',
      ],
    },
    {
      title: 'Igbeti Rangers 1 : 0 Ultimate Rovers: the head coach’s verdict',
      category: 'match-report',
      daysAgo: 13,
      standfirst:
        'Babatunde Oyewole said his side lacked a cutting edge in a narrow defeat away from home.',
      body: [
        'A first-half goal was enough for Igbeti Rangers on a difficult pitch.',
        'Rovers had more of the ball but created few clear chances.',
      ],
    },
    {
      title: 'Welcoming Crystal Spring Water as an official partner',
      category: 'club',
      daysAgo: 16,
      standfirst:
        'The partnership supplies drinking water for the first team, the academy and every home match.',
      body: [
        'Crystal Spring Water joins the club’s family of partners for the rest of the season.',
        'Supporters will see the partner at Nurudeen Grammar School and on the club’s training kit.',
      ],
    },
    {
      title: 'Free coaching clinic returns to Nurudeen Grammar School this December',
      category: 'community',
      daysAgo: 20,
      standfirst:
        'Children aged 8 to 14 can join first-team players and coaches for a free morning of football.',
      body: [
        'The clinic runs from 9am on the second Saturday of December.',
        'Places are limited, so register early through the Contact page.',
      ],
    },
  ]
  for (const a of articlePlan) {
    await payload.create({
      collection: 'articles',
      data: {
        title: a.title,
        category: a.category,
        featured: Boolean(a.featured),
        author: a.author ?? 'Victor Okonkwo',
        standfirst: a.standfirst,
        publishedAt: new Date(now.getTime() - a.daysAgo * 86_400_000).toISOString(),
        relatedMatch: a.relatedMatch,
        heroImage: teamPhoto.id,
        body: richText(a.body),
        _status: 'published',
      },
      overrideAccess: true,
      context: ctx,
    })
  }

  // People.
  for (const [group, list] of Object.entries(people) as Array<
    [keyof typeof people, Array<[string, string, number]>]
  >) {
    let order = 0
    for (const [name, role, sinceYear] of list) {
      await payload.create({
        collection: 'people',
        data: { name, role, group, sinceYear, order: (order += 1) },
        overrideAccess: true,
        context: ctx,
      })
    }
  }

  // Partners.
  let partnerOrder = 0
  for (const [name, tier, blurb, showOnHome] of partners) {
    await payload.create({
      collection: 'partners',
      data: {
        name,
        tier,
        blurb,
        url: 'https://example.com',
        showOnHome,
        order: (partnerOrder += 1),
      },
      overrideAccess: true,
      context: ctx,
    })
  }

  // Honours and timeline.
  for (const [i, [competition, count, years]] of honours.entries()) {
    await payload.create({
      collection: 'honours',
      data: { competition, count, years, order: i },
      overrideAccess: true,
      context: ctx,
    })
  }
  for (const [i, [year, title, text]] of timeline.entries()) {
    await payload.create({
      collection: 'timeline-entries',
      data: { year, title, text, order: i },
      overrideAccess: true,
      context: ctx,
    })
  }

  // Governance documents.
  for (const [i, title] of [
    'Club constitution',
    'Annual report 2025',
    'Safeguarding policy',
    'Supporter charter',
  ].entries()) {
    const data = placeholderPdf(title)
    await payload.create({
      collection: 'documents',
      data: { title, order: i },
      file: { data, mimetype: 'application/pdf', name: `document-${i + 1}.pdf`, size: data.length },
      overrideAccess: true,
      context: ctx,
    })
  }

  // Club settings.
  const draftNote =
    'This is a starting draft for Ultimate Rovers. Have it reviewed before the site goes live.'
  await payload.updateGlobal({
    slug: 'club-settings',
    data: {
      clubName: 'Ultimate Rovers',
      founded: '2016',
      currentSeason: SEASON,
      city: CITY,
      country: 'Nigeria',
      timezone: TZ,
      shortBio:
        'A football club from Ogbomoso, Oyo State, playing for the city and the young people who love the game.',
      ticketsUrl: '',
      broadcastPartner: BROADCAST,
      ground: {
        name: HOME_GROUND,
        // Explicitly empty: updating a global keeps fields that are left out.
        street: null,
        postcode: null,
        capacity: null,
        mapEmbedUrl: null,
        city: `${CITY}, Oyo State`,
        surface: 'Grass',
        accessibleEntry: 'Main school gate',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Nurudeen+Grammar+School+Ogbomoso',
        guide: `Home games are played at ${HOME_GROUND}, ${CITY}. Big games, including derbies and cup ties, move to ${BIG_GAME_GROUND}. Both grounds are a short drive or okada ride from the town centre, with step-free entry through the main gate.`,
      },
      phone: '+234 800 000 0000',
      replyDays: 2,
      officeHours: 'Mon to Fri, 09:00 to 17:00',
      matchdayHours: 'Matchdays, from 3 hours before kick-off',
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
            'Home tickets go on sale five days before each match on the Fixtures page and at the club office. Members get priority access.',
        },
        {
          question: 'How can my child attend academy trials?',
          answer:
            'Trials for under-13s to under-17s run every December at Nurudeen Grammar School. Send a message with the topic Trials and academy and we will send the dates.',
        },
        {
          question: 'How do we become a club partner?',
          answer:
            'Email our commercial team with your organisation and goals, and we will share the partnership packages for the season.',
        },
        {
          question: 'Can we request a player appearance?',
          answer:
            'Yes, for schools, charities and community events in and around Ogbomoso. Send the date, venue and audience at least four weeks ahead.',
        },
        {
          question: 'I am a journalist. How do I get accreditation?',
          answer:
            'Contact the media team with your outlet and the fixture at least 48 hours before kick-off.',
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
      spotlight: [1, 2, 10, 9].map((n) => pid(n)).filter((id): id is number => id !== null),
      crestStory:
        'Our crest carries a triskele at the heart of the ball and a balance mark beneath the name. The three spirals stand for the players, the supporters and the city of Ogbomoso moving together; the balance mark is a promise to play with discipline as well as flair.',
      aboutIntro:
        'Founded in 2016 in Ogbomoso, Ultimate Rovers plays for the young footballers of Oyo State and the community that turns up to watch them. We develop local talent and give it a stage.',
      story: [
        {
          paragraph:
            'Ultimate Rovers began with a group of former school players who wanted a club that gave Ogbomoso’s best young footballers a route into the senior game.',
        },
        {
          paragraph:
            'From pick-up games to the Oyo State League title in 2023, the club has grown one season at a time. The aim now is to keep winning while bringing the next generation through.',
        },
      ],
      crestElements: [
        {
          title: 'The ball',
          text: 'Football sits at the top of the shield, above everything else, because the game comes first.',
        },
        {
          title: 'The triskele',
          text: 'Three spirals turning together: the players, the supporters and the city of Ogbomoso.',
        },
        {
          title: 'The shield',
          text: 'Navy and cyan, the club colours, framing the name and protecting what the club stands for.',
        },
        {
          title: 'The balance mark',
          text: 'A yin and yang symbol beneath the name: discipline and flair, defending and attacking, in balance.',
        },
      ],
      mission:
        'To develop young footballers from Ogbomoso and give them a stage to compete and grow.',
      vision:
        'To be the leading football club in Oyo State and a pathway to the professional game within ten years.',
      values: 'Discipline, community and ambition.',
      academyText:
        'Age groups from under-13 to under-17. Trials run every December at Nurudeen Grammar School.',
      communityText:
        'School visits, free coaching clinics and programmes for young people across Ogbomoso.',
      membershipText: 'Priority tickets, member events and a vote at the annual general meeting.',
      seasonTicketText: 'Every home league match, priority for cup games. From ₦15,000.',
      matchdayTicketText:
        'On sale five days before each home game, online and at the club office. From ₦1,000.',
      matchTicketText:
        'Regular ₦1,000, covered stand ₦2,500, under-16s ₦500. Members get priority until Thursday.',
      partnershipText:
        'Shirt, ground, digital and community packages are open for the 2026/27 season.',
      privacy: richText([
        draftNote,
        { h2: 'Who we are' },
        'Ultimate Rovers is a football club based in Ogbomoso, Oyo State, Nigeria. You can contact us through the Contact page about anything in this policy.',
        { h2: 'What we collect' },
        'When you send a message or join the newsletter we keep your name, email address, any phone number you give us and your message, so that we can reply. We do not sell your details.',
        { h2: 'Your rights and choices' },
        'You can ask us for a copy of your details, ask us to correct them, or ask us to delete them. Write to us through the Contact page.',
      ]),
      terms: richText([
        draftNote,
        { h2: 'Using this site' },
        'This website is run by Ultimate Rovers to share club news, fixtures and information. You may read and share our pages for personal use.',
        { h2: 'Our content' },
        'Photos, videos, the crest and articles belong to the club or our partners. Please ask before using them elsewhere.',
        { h2: 'Tickets' },
        'Ticket purchases are handled by our ticketing partner and are covered by their own terms.',
      ]),
      cookies: richText([
        'This site only sets cookies that it needs to work, such as keeping staff signed in to the club admin. It sets no advertising or tracking cookies, so there is nothing to opt out of.',
        { h2: 'Embedded videos' },
        'Videos from YouTube or Vimeo only load after you press play. Those services may then set their own cookies.',
      ]),
    },
    overrideAccess: true,
    context: ctx,
  })

  payload.logger.info(
    `Seed complete: ${matchCount} matches, ${players.size} players, ${articlePlan.length} articles. Squad from the club team list; other content is sample content.`,
  )
  return true
}
