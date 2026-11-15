import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { RichText } from '@/components/content/RichText'
import { VideoEmbed } from '@/components/content/VideoEmbed'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { FormBoxes } from '@/components/match/Form'
import { HeadToHead } from '@/components/match/HeadToHead'
import { LiveMatchProvider, LiveTimeline } from '@/components/match/LiveMatch'
import { MatchHero } from '@/components/match/MatchHero'
import { Bench, PitchLineup } from '@/components/match/PitchLineup'
import { StatsComparison } from '@/components/match/StatsComparison'
import { JsonLd } from '@/components/seo/JsonLd'
import { buttonClass } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PlayerSilhouette } from '@/components/squad/PlayerSilhouette'
import { TabList, TabPanel } from '@/components/ui/TabList'
import { Tag } from '@/components/ui/Tag'
import { getClub } from '@/lib/data/club'
import {
  getMatchDetail,
  getMatchesBetween,
  getTeamResults,
  getUpcomingMatches,
} from '@/lib/data/matches'
import { getLeagueTable } from '@/lib/data/standings'
import { toSnapshot } from '@/lib/domain/live'
import { formGuide, hasStarted, headToHead, resolveTab, tabsFor } from '@/lib/domain/match'
import { formatDate, formatDayMonth, formatTime } from '@/lib/format'
import { parseMatchParams } from '@/lib/search-params'
import { requestTime } from '@/lib/now'
import { pageMetadata, sportsEventJsonLd } from '@/lib/seo'
import type { FormResult, MatchDetail, TeamRef } from '@/lib/types'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const match = await getMatchDetail(slug)
  if (!match) return { title: 'Match not found' }
  const score = hasStarted(match.status) ? ` ${match.homeScore ?? 0} : ${match.awayScore ?? 0}` : ''
  return pageMetadata({
    title: `${match.home.name}${score ? `${score}` : ' vs'} ${match.away.name}`,
    description: `${match.competition.name}, ${formatDayMonth(match.kickoff, match.timezone)} at ${formatTime(match.kickoff, match.timezone)}. Line-ups, key moments, stats and head to head.`,
    path: `/matches/${slug}`,
  })
}

const card = 'rounded-[14px] border border-line bg-white p-[22px]'
const h2 = 'm-0 font-display text-[36px] leading-none font-black sm:text-[44px]'

function DetailsCard({ match, mapUrl }: { match: MatchDetail; mapUrl: string | null }) {
  const rows: Array<[string, string | null]> = [
    [
      'Kick-off',
      `${formatTime(match.kickoff, match.timezone)}, ${formatDate(match.kickoff, match.timezone)}`,
    ],
    ['Venue', match.venue],
    ['Referee', match.referee],
    ['Broadcast', match.broadcast],
    [
      'Attendance',
      match.status === 'full_time' && match.attendance
        ? new Intl.NumberFormat('en-GB').format(match.attendance)
        : null,
    ],
  ]
  return (
    <div className={card}>
      <h2 className="m-0 mb-3.5 text-[19px]">Match details</h2>
      <dl className="m-0 grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4 gap-y-2.5 text-[15px]">
        {rows
          .filter((r): r is [string, string] => Boolean(r[1]))
          .map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-slate">{k}</dt>
              <dd className="m-0 font-semibold">{v}</dd>
            </div>
          ))}
      </dl>
      {match.home.isUs && mapUrl ? (
        <a
          href={mapUrl}
          rel="noopener"
          className="mt-3 inline-flex min-h-touch items-center text-[15px] font-bold"
        >
          Get directions
        </a>
      ) : null}
    </div>
  )
}

function Overview({
  match,
  form,
  mapUrl,
  defaultTicketText,
}: {
  match: MatchDetail
  form: { home: FormResult[]; away: FormResult[] }
  mapUrl: string | null
  defaultTicketText: string | null
}) {
  const started = hasStarted(match.status)
  const potm = match.playerOfTheMatch
  return (
    <div className="flex flex-wrap gap-8">
      <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-10">
        {started ? (
          <section aria-labelledby="tl-title">
            <h2 id="tl-title" className={`${h2} mb-5`}>
              Key moments
            </h2>
            <LiveTimeline homeName={match.home.name} awayName={match.away.name} />
            <p className="m-0 mt-3 text-[13px] text-slate">
              Key: G goal, Y yellow card, R red card, S substitution.
            </p>
          </section>
        ) : null}

        {match.status === 'full_time' && match.highlights ? (
          <section id="highlights" aria-labelledby="hl-title" className="scroll-mt-4">
            <h2 id="hl-title" className={`${h2} mb-5`}>
              Highlights
            </h2>
            <VideoEmbed
              title={match.highlights.title}
              url={match.highlights.url}
              fileUrl={match.highlights.fileUrl}
              poster={match.highlights.poster}
              durationSeconds={match.highlights.durationSeconds}
              size="lg"
              playLabel="Play match highlights"
            />
          </section>
        ) : null}

        {!started ? (
          <section aria-labelledby="pv-title">
            <h2 id="pv-title" className={`${h2} mb-4`}>
              Match preview
            </h2>
            <p className="m-0 max-w-[680px] text-[18px] leading-[1.65] text-ink-soft">
              {match.preview ?? 'The match preview will be published in the days before kick-off.'}
            </p>
            {match.teamNews.home.length > 0 || match.teamNews.away.length > 0 ? (
              <div className="mt-7 grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-4">
                {(['home', 'away'] as const).map((side) => (
                  <div key={side} className={card}>
                    <h3 className="m-0 mb-3 text-[18px]">
                      {match[side].isUs ? 'Rovers' : match[side].name} team news
                    </h3>
                    {match.teamNews[side].length > 0 ? (
                      <ul className="m-0 list-disc pl-[18px] text-[15px] leading-[1.7] text-ink-soft">
                        {match.teamNews[side].map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="m-0 text-[15px] text-slate">No team news yet.</p>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        <section aria-labelledby="form-title">
          <h2 id="form-title" className={`${h2} mb-4`}>
            Form going in
          </h2>
          <div className="rounded-[14px] border border-line bg-white">
            {(['home', 'away'] as const).map((side, i) => (
              <div
                key={side}
                className={`flex flex-wrap items-center justify-between gap-3 px-5 py-4 ${i > 0 ? 'border-t border-line' : ''}`}
              >
                <span className="font-bold">{match[side].name}</span>
                <FormBoxes form={form[side]} />
              </div>
            ))}
          </div>
          <p className="m-0 mt-2.5 text-[13px] text-slate">
            Last five matches, oldest on the left. Each box shows W, D or L.
          </p>
        </section>
      </div>

      <aside
        className="flex min-w-0 flex-[1_1_320px] flex-col gap-4"
        aria-label="Match information"
      >
        <DetailsCard match={match} mapUrl={mapUrl} />
        {match.status === 'full_time' && potm ? (
          <div className="rounded-[14px] bg-night p-[22px] text-white">
            <h2 className="m-0 text-[19px]">Player of the match</h2>
            <div className="mt-3.5 flex items-center gap-3.5">
              <div
                aria-hidden="true"
                className="flex size-16 flex-[0_0_64px] items-end justify-center overflow-hidden rounded-full bg-navy"
              >
                <PlayerSilhouette photo={potm.photo} className="w-[76%]" sizes="64px" />
              </div>
              <div>
                <p className="m-0 font-display text-card-title font-extrabold uppercase">
                  {potm.surname}
                </p>
                <Link
                  href={`/squad/${potm.slug}`}
                  className="text-[14px] font-semibold text-cyan hover:text-white"
                >
                  View profile
                  <span className="sr-only">
                    : {potm.firstName} {potm.surname}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        ) : null}
        {match.status === 'scheduled' && match.home.isUs ? (
          <div className="rounded-[14px] bg-night p-[22px] text-white">
            <h2 className="m-0 text-[19px]">Tickets</h2>
            <p className="mt-2.5 mb-4 text-[15px] leading-[1.55] text-mist-text">
              {match.ticketInfo ?? defaultTicketText ?? 'Ticket details will be announced soon.'}
            </p>
            {match.ticketUrl &&
            (match.ticketAvailability === 'on_sale' ||
              match.ticketAvailability === 'members_only') ? (
              <a
                href={match.ticketUrl}
                rel="noopener"
                className={buttonClass({ variant: 'primary-dark', size: 'md', px: 'px-5' })}
              >
                Buy tickets
              </a>
            ) : (
              <p className="m-0 text-[15px] font-bold">
                {match.ticketAvailability === 'sold_out' ? 'Sold out' : 'Not on sale yet'}
              </p>
            )}
          </div>
        ) : null}
      </aside>
    </div>
  )
}

function Lineups({ match }: { match: MatchDetail }) {
  const predicted = !match.lineupsConfirmed
  const { home, away } = match.lineups
  const hasXI = home.starting.length > 0 || away.starting.length > 0
  const formations = [
    home.formation ? `${match.home.isUs ? 'Rovers' : match.home.name} ${home.formation}` : null,
    away.formation ? `${match.away.isUs ? 'Rovers' : match.away.name} ${away.formation}` : null,
  ]
    .filter(Boolean)
    .join(', ')
  return (
    <section aria-labelledby="lu-title">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="lu-title" className={h2}>
          {predicted ? 'Predicted line-ups' : 'Line-ups'}
        </h2>
        {formations ? <p className="m-0 text-[15px] text-slate">{formations}</p> : null}
      </div>
      {hasXI ? (
        <>
          <PitchLineup
            home={home}
            away={away}
            homeName={match.home.name}
            awayName={match.away.name}
          />
          <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-4">
            <Bench teamName={match.home.name} lineup={home} />
            <Bench teamName={match.away.name} lineup={away} />
          </div>
        </>
      ) : (
        <EmptyState>Line-ups are confirmed about an hour before kick-off.</EmptyState>
      )}
    </section>
  )
}

function Report({ match }: { match: MatchDetail }) {
  const r = match.report
  if (!r) {
    return (
      <EmptyState className="mx-auto max-w-[760px]">
        The match report will appear here after the final whistle.
      </EmptyState>
    )
  }
  return (
    <article aria-labelledby="rp-title" className="mx-auto w-full max-w-[760px]">
      <p className="m-0 text-[14px] font-semibold text-navy">
        Match report{r.author ? `, by ${r.author}` : ''}
      </p>
      <h2
        id="rp-title"
        className="mt-2.5 mb-0 font-display text-[40px] leading-[0.98] font-black sm:text-[56px]"
      >
        {r.headline}
      </h2>
      {r.standfirst ? (
        <p className="mt-[18px] mb-0 text-[20px] leading-[1.6] text-ink-soft">{r.standfirst}</p>
      ) : null}
      {r.heroImage ? (
        <Image
          src={r.heroImage.url}
          alt={r.heroImage.alt}
          width={r.heroImage.width}
          height={r.heroImage.height}
          sizes="(max-width: 800px) 100vw, 760px"
          className="mt-7 aspect-video w-full rounded-[14px] object-cover"
        />
      ) : (
        <div aria-hidden="true" className="mt-7 aspect-video rounded-[14px] bg-line" />
      )}
      <RichText value={r.body} className="mt-7" />
      {r.coachQuote ? (
        <blockquote className="my-7 rounded-[14px] bg-night px-7 py-6 text-white">
          <p className="m-0 font-display text-[30px] leading-[1.05] font-extrabold">
            “{r.coachQuote}”
          </p>
        </blockquote>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-5">
        {r.articleSlug ? (
          <Link href={`/news/${r.articleSlug}`} className="text-[15px] font-bold">
            Read the full article
          </Link>
        ) : null}
        <Link href="/news?category=match-report" className="text-[15px] font-bold">
          More match reports
        </Link>
      </div>
    </article>
  )
}

export default async function MatchPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { tab: requestedTab } = parseMatchParams(await searchParams)
  const match = await getMatchDetail(slug)
  if (!match) notFound()

  const club = await getClub()
  const tab = resolveTab(match.status, requestedTab)
  const us: TeamRef | null = match.home.isUs ? match.home : match.away.isUs ? match.away : null
  const opponent = us ? (match.home.isUs ? match.away : match.home) : match.away

  const [meetings, usResults, table, upcoming] = await Promise.all([
    us ? getMatchesBetween(us.id, opponent.id) : Promise.resolve([]),
    us ? getTeamResults(us.id) : Promise.resolve([]),
    getLeagueTable(match.season),
    getUpcomingMatches(),
  ])

  const formFor = (team: TeamRef): FormResult[] =>
    team.isUs
      ? formGuide(team.id, usResults, match.kickoff)
      : (table?.rows.find((r) => r.team.id === team.id)?.form ?? [])
  const form = { home: formFor(match.home), away: formFor(match.away) }
  const h2h = headToHead(us?.id ?? 0, opponent.id, meetings, match.kickoff)
  const serverNow = requestTime()
  const comingUp = upcoming
    .filter(
      (m) =>
        m.id !== match.id && m.status === 'scheduled' && new Date(m.kickoff).getTime() > serverNow,
    )
    .slice(0, 3)

  const tabs = tabsFor(match.status).map((t) => ({
    key: t.key,
    label: t.label,
    href: `/matches/${slug}${t.key === 'overview' ? '' : `?tab=${t.key}`}`,
  }))

  return (
    <LiveMatchProvider slug={slug} initial={toSnapshot(match)}>
      <JsonLd data={sportsEventJsonLd(match)} />
      <Breadcrumbs
        items={[
          { label: 'Fixtures & results', href: '/fixtures' },
          {
            label: match.competition.name,
            href: `/fixtures?competition=${match.competition.type}`,
          },
          { label: match.title },
        ]}
      />
      <MatchHero match={match} city={club.city} serverNow={serverNow} />

      <div className="border-b border-line bg-white">
        <div className="wrap">
          <TabList
            label="Match sections"
            idPrefix="match"
            variant="underline"
            active={tab}
            items={tabs}
          />
        </div>
      </div>

      <div className="wrap flex flex-col gap-16 pt-12 pb-[72px]">
        <TabPanel idPrefix="match" active={tab}>
          {tab === 'overview' ? (
            <Overview
              match={match}
              form={form}
              mapUrl={club.ground.mapUrl}
              defaultTicketText={club.tickets.match}
            />
          ) : null}
          {tab === 'lineups' ? <Lineups match={match} /> : null}
          {tab === 'stats' ? (
            <section aria-labelledby="ms-title" className="mx-auto w-full max-w-[880px]">
              <h2 id="ms-title" className={`${h2} mb-5 text-center`}>
                Match stats
              </h2>
              {match.stats ? (
                <>
                  <StatsComparison
                    home={{
                      ...match.stats.home,
                      yellowCards:
                        match.stats.home.yellowCards ??
                        match.events.filter(
                          (e) =>
                            e.side === 'home' &&
                            (e.type === 'yellow' || e.type === 'second_yellow'),
                        ).length,
                    }}
                    away={{
                      ...match.stats.away,
                      yellowCards:
                        match.stats.away.yellowCards ??
                        match.events.filter(
                          (e) =>
                            e.side === 'away' &&
                            (e.type === 'yellow' || e.type === 'second_yellow'),
                        ).length,
                    }}
                    homeName={match.home.name}
                    awayName={match.away.name}
                  />
                  <p className="m-0 mt-3 text-center text-[13px] text-slate">
                    Bars split in proportion to each side’s figure. {match.home.name} in navy.
                  </p>
                </>
              ) : (
                <EmptyState>Match stats will appear here once the match is under way.</EmptyState>
              )}
            </section>
          ) : null}
          {tab === 'report' ? <Report match={match} /> : null}
          {tab === 'h2h' ? (
            <section aria-labelledby="h2h-title" className="mx-auto w-full max-w-[880px]">
              <h2 id="h2h-title" className={`${h2} mb-5 text-center`}>
                Head to head
              </h2>
              <HeadToHead record={h2h} opponentName={opponent.name} />
            </section>
          ) : null}
        </TabPanel>

        <section aria-labelledby="next-title" className="border-t-2 border-night pt-8">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-4">
            <h2 id="next-title" className="m-0 font-display text-[40px] leading-none font-black">
              Coming up
            </h2>
            <Link href="/fixtures" className="text-[15px] font-semibold">
              All fixtures
            </Link>
          </div>
          {comingUp.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-4">
              {comingUp.map((m) => (
                <Link
                  key={m.id}
                  href={`/matches/${m.slug}`}
                  className="flex flex-col gap-2.5 rounded-card border border-line bg-white p-[18px] text-ink no-underline hover:border-navy hover:text-ink"
                >
                  <Tag>{m.competition.shortName}</Tag>
                  <span className="text-[17px] font-bold">{m.title}</span>
                  <span className="text-[14px] text-slate">
                    {formatDayMonth(m.kickoff, m.timezone)}, {formatTime(m.kickoff, m.timezone)}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="m-0 text-slate">No more fixtures announced yet.</p>
          )}
        </section>
      </div>
    </LiveMatchProvider>
  )
}
