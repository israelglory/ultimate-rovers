import type { Metadata } from 'next'

import { PageHero } from '@/components/layout/PageHero'
import { PlayerCardSquad } from '@/components/squad/PlayerCard'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { FilterChip } from '@/components/ui/FilterChip'
import { ParamForm } from '@/components/ui/ParamForm'
import { getClub } from '@/lib/data/club'
import { getSquad } from '@/lib/data/players'
import { parseSquadParams } from '@/lib/search-params'
import { pageMetadata } from '@/lib/seo'
import { positionGroups } from '@/lib/squad'

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export async function generateMetadata(): Promise<Metadata> {
  const club = await getClub()
  return pageMetadata({
    title: 'First team squad',
    description: `The ${club.name} ${club.currentSeason} first team squad by position, with profiles, stats and videos.`,
    path: '/squad',
  })
}

export default async function SquadPage({ searchParams }: Props) {
  const { position } = parseSquadParams(await searchParams)
  const [club, squad] = await Promise.all([getClub(), getSquad()])
  const groups = positionGroups
    .filter((g) => !position || g.filter === position)
    .map((g) => ({ ...g, players: squad.filter((p) => p.positionGroup === g.group) }))
  const chips = [
    { value: '', label: 'All players', count: squad.length },
    ...positionGroups.map((g) => ({
      value: g.filter,
      label: g.title,
      count: squad.filter((p) => p.positionGroup === g.group).length,
    })),
  ]

  return (
    <>
      <PageHero
        id="sq-title"
        title="First team squad"
        intro={`The ${club.currentSeason} squad by position. Choose a player to see their profile, stats and videos.`}
      >
        <ParamForm className="mt-7" aria-label="Filter by position">
          <div role="group" aria-label="Filter by position" className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <FilterChip
                key={c.label}
                name="position"
                value={c.value}
                on={(position ?? '') === c.value}
                size="md"
              >
                {c.label} <span className="opacity-75">{c.count}</span>
              </FilterChip>
            ))}
          </div>
        </ParamForm>
      </PageHero>

      <div className="wrap flex flex-col gap-16 pt-14 pb-[72px]">
        {squad.length === 0 ? (
          <EmptyState>The squad for the new season will be announced soon.</EmptyState>
        ) : (
          groups.map((g) => (
            <section key={g.group} aria-labelledby={`group-${g.filter}`}>
              <div className="mb-6 flex items-baseline gap-3.5 border-b-2 border-night pb-3">
                <h2
                  id={`group-${g.filter}`}
                  className="m-0 font-display text-[40px] leading-none font-black md:text-[48px]"
                >
                  {g.title}
                </h2>
                <span className="text-[16px] text-slate">
                  {g.players.length} {g.players.length === 1 ? 'player' : 'players'}
                </span>
              </div>
              {g.players.length > 0 ? (
                <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(230px,100%),1fr))] gap-5 p-0">
                  {g.players.map((p) => (
                    <li key={p.id} className="flex">
                      <PlayerCardSquad p={p} />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState>
                  No {g.title.toLowerCase()} in the squad yet. Choose All players to see everyone.
                </EmptyState>
              )}
            </section>
          ))
        )}

        <section
          aria-labelledby="staff-title"
          className="flex flex-wrap items-center justify-between gap-5 rounded-feature bg-night p-7 text-white md:p-9"
        >
          <div className="max-w-[640px]">
            <h2 id="staff-title" className="m-0 font-display text-[40px] leading-none font-black">
              Behind the squad
            </h2>
            <p className="m-0 mt-2.5 text-[16px] leading-[1.55] text-mist-text">
              Meet the head coach, technical staff, medical team and the people who run the club.
            </p>
          </div>
          <ButtonLink href="/club/stakeholders#technical" variant="primary-dark">
            Meet the staff
          </ButtonLink>
        </section>
      </div>
    </>
  )
}
