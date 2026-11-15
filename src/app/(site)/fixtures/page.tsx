import type { Metadata } from 'next'
import Link from 'next/link'

import { PageHero } from '@/components/layout/PageHero'
import { FullTable } from '@/components/match/LeagueTable'
import { FixtureRow, ResultRow } from '@/components/match/MatchRows'
import { buttonClass } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { FilterChip } from '@/components/ui/FilterChip'
import { CalendarIcon } from '@/components/ui/icons'
import { AutoSubmitSelect, ParamForm } from '@/components/ui/ParamForm'
import { TabList, TabPanel } from '@/components/ui/TabList'
import { getClub } from '@/lib/data/club'
import { getSeasonMatches, getSeasons } from '@/lib/data/matches'
import { getLeagueTable } from '@/lib/data/standings'
import { formatMonthYear } from '@/lib/format'
import {
  type CompetitionFilter,
  type FixtureView,
  parseFixturesParams,
  seasonToParam,
  toQuery,
} from '@/lib/search-params'
import { pageMetadata } from '@/lib/seo'
import type { MatchSummary } from '@/lib/types'

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: 'Fixtures and results',
    description:
      'Every Ultimate Rovers fixture and result, the league table, and tickets for the next home game.',
    path: '/fixtures',
  })
}

const views: Array<{ key: FixtureView; label: string }> = [
  { key: 'fixtures', label: 'Fixtures' },
  { key: 'results', label: 'Results' },
  { key: 'table', label: 'Table' },
]

const chips: Array<{ value: CompetitionFilter | ''; label: string }> = [
  { value: '', label: 'All' },
  { value: 'league', label: 'League' },
  { value: 'cup', label: 'Cup' },
  { value: 'friendly', label: 'Friendly' },
]

function groupByMonth(matches: MatchSummary[], timeZone: string) {
  const groups = new Map<string, MatchSummary[]>()
  for (const m of matches) {
    const key = formatMonthYear(m.kickoff, timeZone)
    groups.set(key, [...(groups.get(key) ?? []), m])
  }
  return [...groups.entries()]
}

export default async function FixturesPage({ searchParams }: Props) {
  const { view, competition, season: requestedSeason } = parseFixturesParams(await searchParams)
  const club = await getClub()
  const seasons = await getSeasons(club.currentSeason)
  const season =
    requestedSeason && seasons.includes(requestedSeason) ? requestedSeason : club.currentSeason
  const [matches, table] = await Promise.all([getSeasonMatches(season), getLeagueTable(season)])

  const filtered = competition ? matches.filter((m) => m.competition.type === competition) : matches
  const fixtures = filtered.filter((m) => m.status !== 'full_time')
  const results = filtered.filter((m) => m.status === 'full_time').reverse()
  const seasonParam = season === club.currentSeason ? undefined : seasonToParam(season)
  const hrefFor = (key: FixtureView) =>
    `/fixtures${toQuery({ view: key === 'fixtures' ? undefined : key, competition, season: seasonParam })}`

  return (
    <>
      <PageHero id="fx-title" title="Fixtures &amp; results" flush>
        <ParamForm
          defaults={{ season: seasonToParam(club.currentSeason), view: 'fixtures' }}
          className="mt-7 flex flex-wrap items-end gap-x-6 gap-y-4"
          aria-label="Filter fixtures"
        >
          <input type="hidden" name="view" value={view} />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="season" className="text-[14px] text-mist-text">
              Season
            </label>
            <div className="flex gap-2">
              <AutoSubmitSelect
                id="season"
                name="season"
                defaultValue={seasonToParam(season)}
                className="min-h-[46px] min-w-[180px] rounded-button border border-border-dark bg-navy px-3.5 text-[15px] text-white"
              >
                {seasons.map((s) => (
                  <option key={s} value={seasonToParam(s)}>
                    {s}
                  </option>
                ))}
              </AutoSubmitSelect>
              <noscript>
                <button
                  type="submit"
                  className={buttonClass({
                    variant: 'ghost-dark',
                    size: 'sm',
                    minH: 'min-h-[46px]',
                  })}
                >
                  Apply
                </button>
              </noscript>
            </div>
          </div>
          <div role="group" aria-label="Competition" className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <FilterChip
                key={c.label}
                name="competition"
                value={c.value}
                on={(competition ?? '') === c.value}
              >
                {c.label}
              </FilterChip>
            ))}
          </div>
          {/* After the chips on purpose: a pressed chip's value comes first and wins. */}
          <input type="hidden" name="competition" value={competition ?? ''} />
          <Link
            href="/fixtures.ics"
            prefetch={false}
            className={buttonClass({
              variant: 'ghost-dark',
              size: 'md',
              minH: 'min-h-[46px]',
              px: 'px-4',
              className: 'sm:ml-auto',
            })}
          >
            <CalendarIcon />
            Sync fixtures to calendar
          </Link>
        </ParamForm>
        <TabList
          label="View"
          idPrefix="fixtures"
          variant="folder"
          active={view}
          items={views.map((v) => ({ key: v.key, label: v.label, href: hrefFor(v.key) }))}
          className="mt-9"
        />
      </PageHero>

      <div className="wrap pt-12 pb-[72px]">
        <TabPanel idPrefix="fixtures" active={view}>
          {view === 'fixtures' ? (
            fixtures.length > 0 ? (
              <div className="flex flex-col gap-10">
                {groupByMonth(fixtures, club.timezone).map(([month, items]) => (
                  <section key={month} aria-label={month}>
                    <h2 className="m-0 mb-4 font-display text-[34px] font-extrabold">{month}</h2>
                    <div className="flex flex-col gap-3">
                      {items.map((m) => (
                        <FixtureRow key={m.id} m={m} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <EmptyState>
                {competition
                  ? 'No fixtures in this competition yet. Choose All to see the full schedule.'
                  : 'No fixtures announced for this season yet. Check back soon.'}
              </EmptyState>
            )
          ) : null}

          {view === 'results' ? (
            results.length > 0 ? (
              <>
                <h2 className="sr-only">Results</h2>
                <div className="flex flex-col gap-3">
                  {results.map((m) => (
                    <ResultRow key={m.id} m={m} />
                  ))}
                </div>
              </>
            ) : (
              <EmptyState>
                {competition
                  ? 'No results in this competition yet. Choose All to see every result.'
                  : 'No results yet this season.'}
              </EmptyState>
            )
          ) : null}

          {view === 'table' ? (
            table ? (
              <FullTable rows={table.rows} title={`${table.competition.name} standings`} />
            ) : (
              <EmptyState>
                The league table appears here once standings are published for this season.
              </EmptyState>
            )
          ) : null}
        </TabPanel>

        <section aria-labelledby="tix-title" className="mt-16">
          <h2
            id="tix-title"
            className="m-0 mb-5 font-display text-[40px] leading-none font-black md:text-[48px]"
          >
            Tickets and matchday
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-4">
            <div className="rounded-card bg-night p-6 text-white">
              <h3 className="m-0 text-[20px]">Season tickets</h3>
              <p className="mt-2.5 mb-[18px] text-[15px] leading-[1.55] text-mist-text">
                {club.tickets.season ?? 'Every home league match, with priority for cup games.'}
              </p>
              <Link
                href="/contact?topic=tickets"
                className={buttonClass({ variant: 'primary-dark', size: 'sm', px: 'px-[18px]' })}
              >
                Get a season ticket
              </Link>
            </div>
            <div className="rounded-card border border-line bg-white p-6">
              <h3 className="m-0 text-[20px]">Matchday tickets</h3>
              <p className="mt-2.5 mb-[18px] text-[15px] leading-[1.55] text-slate">
                {club.tickets.matchday ??
                  'On sale before each home game, online and at the ground.'}
              </p>
              <Link href="/contact?topic=tickets" className="text-[15px] font-bold">
                Ticket prices and gates
              </Link>
            </div>
            <div className="rounded-card border border-line bg-white p-6">
              <h3 className="m-0 text-[20px]">Getting to the ground</h3>
              <p className="mt-2.5 mb-[18px] text-[15px] leading-[1.55] text-slate">
                {club.ground.guide ?? 'Parking, transport and accessible entry.'}
              </p>
              <Link href="/club#ground-title" className="text-[15px] font-bold">
                Stadium guide
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
