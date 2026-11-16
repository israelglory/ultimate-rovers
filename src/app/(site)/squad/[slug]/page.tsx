import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { RichText } from '@/components/content/RichText'
import { VideoEmbed } from '@/components/content/VideoEmbed'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { PlayerCardCompact } from '@/components/squad/PlayerCard'
import { PlayerSilhouette } from '@/components/squad/PlayerSilhouette'
import { EmptyState } from '@/components/ui/EmptyState'
import { ShareButton } from '@/components/ui/ShareButton'
import { type SocialLink, SocialLinks } from '@/components/ui/SocialLinks'
import { TabList, TabPanel } from '@/components/ui/TabList'
import { getClub } from '@/lib/data/club'
import { getPlayerProfile, getSquad } from '@/lib/data/players'
import { ageOn, formatDate, formatMonthYearUtc, formatNumber } from '@/lib/format'
import { parsePlayerParams } from '@/lib/search-params'
import { absoluteUrl } from '@/lib/site'
import { personJsonLd, pageMetadata } from '@/lib/seo'
import { groupInfo } from '@/lib/squad'
import type { StatLine } from '@/lib/types'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const club = await getClub()
  const player = await getPlayerProfile(slug, club.currentSeason, club.name)
  if (!player) return { title: 'Player not found' }
  const role = groupInfo(player.positionGroup).singular
  return pageMetadata({
    title: `${player.firstName} ${player.surname}`,
    description: `${player.firstName} ${player.surname}${player.squadNumber != null ? `, number ${player.squadNumber}` : ''}, ${role.toLowerCase()} for ${club.name}. Profile, stats, videos and career.`,
    path: `/squad/${slug}`,
    type: 'profile',
    hasImageFile: true,
  })
}

const statTiles: Array<{ key: keyof StatLine; label: string }> = [
  { key: 'appearances', label: 'Appearances' },
  { key: 'starts', label: 'Starts' },
  { key: 'goals', label: 'Goals' },
  { key: 'assists', label: 'Assists' },
  { key: 'minutes', label: 'Minutes played' },
  { key: 'shotsOnTarget', label: 'Shots on target' },
  { key: 'yellowCards', label: 'Yellow cards' },
  { key: 'redCards', label: 'Red cards' },
]

const footLabel: Record<string, string> = { right: 'Right', left: 'Left', both: 'Both' }
const h2 = 'm-0 font-display text-[40px] leading-none font-black md:text-[48px]'

export default async function PlayerPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { stats: period } = parsePlayerParams(await searchParams)
  const club = await getClub()
  const [player, squad] = await Promise.all([
    getPlayerProfile(slug, club.currentSeason, club.name),
    getSquad(),
  ])
  if (!player) notFound()

  const group = groupInfo(player.positionGroup)
  const index = squad.findIndex((p) => p.id === player.id)
  const previous = index > 0 ? squad[index - 1] : undefined
  const next = index >= 0 && index < squad.length - 1 ? squad[index + 1] : undefined
  const more = squad
    .filter((p) => p.positionGroup === player.positionGroup && p.id !== player.id)
    .slice(0, 3)
  const fullName = `${player.firstName} ${player.surname}`

  const facts: Array<[string, string | null]> = [
    ['Date of birth', player.dateOfBirth ? formatDate(player.dateOfBirth, 'UTC') : null],
    ['Age', player.dateOfBirth ? String(ageOn(player.dateOfBirth)) : null],
    ['Nationality', player.nationality],
    ['Height', player.heightCm ? `${player.heightCm} cm` : null],
    ['Preferred foot', player.preferredFoot ? (footLabel[player.preferredFoot] ?? null) : null],
    ['Joined', player.joined ? formatMonthYearUtc(player.joined) : null],
    ['Previous club', player.previousClub],
    ['Contract until', player.contractUntil ? String(player.contractUntil) : null],
  ]
  const socials: SocialLink[] = player.socials.map((s) => ({ platform: s.platform, url: s.url }))
  const stats = period === 'career' ? player.careerStats : player.seasonStats
  const shotsKnown =
    period === 'career' ? player.shotsOnTargetKnown.career : player.shotsOnTargetKnown.season

  return (
    <>
      <JsonLd
        data={personJsonLd({
          firstName: player.firstName,
          surname: player.surname,
          slug: player.slug,
          nationality: player.nationality,
          dateOfBirth: player.dateOfBirth,
          heightCm: player.heightCm,
          position: player.position ?? group.singular,
          clubName: club.name,
          image: player.photo ? absoluteUrl(player.photo.url) : undefined,
        })}
      />
      <Breadcrumbs
        items={[
          { label: 'Squad', href: '/squad' },
          { label: group.title, href: `/squad?position=${group.filter}` },
          { label: fullName },
        ]}
        actions={
          <div className="flex gap-1">
            {previous ? (
              <Link
                href={`/squad/${previous.slug}`}
                className="inline-flex min-h-touch items-center px-3 text-[14px] font-semibold"
              >
                Previous player
                <span className="sr-only">
                  : {previous.firstName} {previous.surname}
                </span>
              </Link>
            ) : null}
            {next ? (
              <Link
                href={`/squad/${next.slug}`}
                className="inline-flex min-h-touch items-center px-3 text-[14px] font-semibold"
              >
                Next player
                <span className="sr-only">
                  : {next.firstName} {next.surname}
                </span>
              </Link>
            ) : null}
          </div>
        }
      />

      <section aria-labelledby="pl-name" className="overflow-hidden bg-night text-white">
        <div className="wrap flex flex-wrap items-stretch gap-12 pt-12 pb-14">
          <div className="relative flex aspect-[4/5] max-w-[480px] min-w-0 flex-[1_1_380px] items-end justify-center overflow-hidden rounded-feature bg-navy">
            {player.squadNumber != null ? (
              <span
                aria-hidden="true"
                className="number-outline absolute -top-2.5 left-5 font-display text-[200px] leading-none font-black [-webkit-text-stroke-width:3px] sm:text-[300px]"
              >
                {player.squadNumber}
              </span>
            ) : null}
            <PlayerSilhouette
              photo={player.photo}
              sizes="(max-width: 520px) 100vw, 480px"
              priority
              className={player.photo ? 'w-full' : 'w-[78%]'}
            />
          </div>
          <div className="flex min-w-0 flex-[1_1_480px] flex-col justify-center">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-pill bg-cyan px-3 py-1.5 text-[14px] font-bold text-night">
                {group.singular}
              </span>
              {player.squadNumber != null ? (
                <span className="rounded-pill border border-border-dark px-3 py-1.5 text-[14px] font-semibold">
                  No. {player.squadNumber}
                </span>
              ) : null}
              {player.status === 'on_loan' ? (
                <span className="rounded-pill border border-border-dark px-3 py-1.5 text-[14px] font-semibold">
                  On loan
                </span>
              ) : null}
            </div>
            <h1 id="pl-name" className="m-0 mt-5 font-display leading-[0.86] font-black">
              <span className="block text-[40px] font-bold text-mist-text">{player.firstName}</span>
              <span className="block text-[clamp(64px,9vw,132px)] break-words uppercase">
                {player.surname}
              </span>
            </h1>
            <dl className="m-0 mt-8 grid grid-cols-[repeat(auto-fit,minmax(min(170px,100%),1fr))] gap-x-6 gap-y-5">
              {facts
                .filter((f): f is [string, string] => Boolean(f[1]))
                .map(([k, v]) => (
                  <div key={k} className="border-t border-line-dark pt-2.5">
                    <dt className="text-[13px] text-mist-text">{k}</dt>
                    <dd className="m-0 mt-1 text-[17px] font-bold">{v}</dd>
                  </div>
                ))}
            </dl>
            <div className="mt-7 flex flex-wrap items-center gap-2">
              {socials.length > 0 ? (
                <>
                  <span className="mr-1.5 text-[14px] text-mist-text">Follow</span>
                  <SocialLinks links={socials} labelPrefix={fullName} />
                </>
              ) : null}
              <div className="ml-auto">
                <ShareButton
                  label="Share profile"
                  title={fullName}
                  style={{ variant: 'ghost-dark', size: 'sm', px: 'px-[18px]' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap flex flex-col gap-[72px] pt-16 pb-20">
        <section aria-labelledby="stats-title">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <h2 id="stats-title" className={h2}>
              Stats
            </h2>
            <TabList
              label="Stats period"
              idPrefix="stats"
              variant="segmented"
              active={period}
              items={[
                { key: 'season', label: 'This season', href: `/squad/${slug}` },
                {
                  key: 'career',
                  label: 'All competitions, career',
                  href: `/squad/${slug}?stats=career`,
                },
              ]}
            />
          </div>
          <TabPanel idPrefix="stats" active={period}>
            <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-4">
              {statTiles.map((t) => {
                const value =
                  t.key === 'shotsOnTarget' && !shotsKnown ? '-' : formatNumber(stats[t.key])
                return (
                  <li key={t.key} className="rounded-card border border-line bg-white p-5">
                    <span className="block font-display text-[56px] leading-none font-black text-navy">
                      {value}
                    </span>
                    <span className="mt-1.5 block text-[14px] text-slate">{t.label}</span>
                  </li>
                )
              })}
            </ul>
            <p className="m-0 mt-3 text-[13px] text-slate">
              {period === 'season'
                ? `Figures for ${club.currentSeason}, all competitions. Updated after every match.`
                : 'Career figures across every club, league and cup.'}
            </p>
          </TabPanel>
        </section>

        <section aria-labelledby="vid-title">
          <h2 id="vid-title" className={`${h2} mb-5`}>
            Videos
          </h2>
          {player.videos.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] gap-6">
              {player.videos.map((v) => (
                <figure key={v.id} className="m-0">
                  <VideoEmbed
                    title={v.title}
                    url={v.url}
                    fileUrl={v.fileUrl}
                    poster={v.poster}
                    durationSeconds={v.durationSeconds}
                    playLabel={`Play ${v.title.toLowerCase()}`}
                  />
                  <figcaption className="mt-3">
                    <span className="block text-[18px] font-bold">{v.title}</span>
                    {v.caption ? (
                      <span className="mt-1 block text-[14px] text-slate">{v.caption}</span>
                    ) : null}
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <EmptyState>Videos of {player.firstName} will appear here.</EmptyState>
          )}
        </section>

        {player.biography || player.quote ? (
          <section aria-labelledby="bio-title" className="flex flex-wrap gap-12">
            <div className="min-w-0 flex-[999_1_520px]">
              <h2 id="bio-title" className={`${h2} mb-4`}>
                Biography
              </h2>
              <RichText value={player.biography} className="max-w-[680px] leading-[1.65]" />
            </div>
            {player.quote ? (
              <blockquote className="m-0 flex min-w-0 flex-[1_1_320px] flex-col justify-between gap-5 rounded-feature bg-navy p-8 text-white">
                <p className="m-0 font-display text-[34px] leading-[1.05] font-extrabold">
                  “{player.quote}”
                </p>
                <footer className="text-[14px] text-mist-text">{fullName}</footer>
              </blockquote>
            ) : null}
          </section>
        ) : null}

        <section aria-labelledby="career-title">
          <h2 id="career-title" className={`${h2} mb-5`}>
            Career
          </h2>
          {player.career.length > 0 ? (
            <div
              className="relative overflow-x-auto rounded-card border border-line bg-white"
              role="region"
              aria-labelledby="career-title"
              tabIndex={0}
            >
              <table className="w-full min-w-[560px] border-collapse text-[15px]">
                <thead>
                  <tr className="text-slate">
                    <th scope="col" className="px-5 py-3.5 text-left font-semibold">
                      Season
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-left font-semibold">
                      Club
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-right font-semibold">
                      <abbr title="Appearances" className="no-underline">
                        Apps
                      </abbr>
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-right font-semibold">
                      Goals
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-right font-semibold">
                      Assists
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {player.career.map((c, i) => (
                    <tr key={`${c.season}-${i}`} className="border-t border-line">
                      <td className="px-5 py-3.5">{c.season}</td>
                      <th scope="row" className="px-5 py-3.5 text-left font-semibold">
                        {c.club}
                      </th>
                      <td className="px-5 py-3.5 text-right">{c.apps ?? '-'}</td>
                      <td className="px-5 py-3.5 text-right">{c.goals ?? '-'}</td>
                      <td className="px-5 py-3.5 text-right">{c.assists ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState>Career history has not been added yet.</EmptyState>
          )}
        </section>

        <section aria-labelledby="more-title">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-4">
            <h2 id="more-title" className={h2}>
              More {group.title.toLowerCase()}
            </h2>
            <Link href="/squad" className="text-[15px] font-semibold">
              Back to squad
            </Link>
          </div>
          {more.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-5">
              {more.map((p) => (
                <PlayerCardCompact key={p.id} p={p} />
              ))}
            </div>
          ) : (
            <EmptyState>No other {group.title.toLowerCase()} in the squad.</EmptyState>
          )}
        </section>
      </div>
    </>
  )
}
