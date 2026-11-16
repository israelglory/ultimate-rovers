import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { NewsCardCompact, NewsCardFeatured } from '@/components/content/NewsCard'
import { PartnerLogo } from '@/components/content/PartnerLogo'
import { VideoEmbed } from '@/components/content/VideoEmbed'
import { CompactTable } from '@/components/match/LeagueTable'
import { ResultCard, ResultCardCompact } from '@/components/match/MatchRows'
import { NextMatchStrip } from '@/components/match/NextMatchStrip'
import { JsonLd } from '@/components/seo/JsonLd'
import { PlayerCardSpotlight } from '@/components/squad/PlayerCard'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Motif } from '@/components/ui/Motif'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { getHomeNews } from '@/lib/data/articles'
import { getClub } from '@/lib/data/club'
import { getLatestVideos, getPartners } from '@/lib/data/content'
import { getRecentResults, getUpcomingMatches } from '@/lib/data/matches'
import { getSpotlight } from '@/lib/data/players'
import { getLeagueTable } from '@/lib/data/standings'
import { windowAroundClub } from '@/lib/domain/standings'
import { formatDuration } from '@/lib/format'
import { requestTime } from '@/lib/now'
import { pageMetadata, sportsTeamJsonLd } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const club = await getClub()
  return {
    ...pageMetadata({ title: club.name, description: club.home.heroIntro, path: '/' }),
    title: { absolute: `${club.name}: official club website` },
  }
}

/** Kick-off within the last two hours still counts as "next" until staff set the match live. */
const NEXT_MATCH_GRACE_MS = 2 * 60 * 60 * 1000

export default async function HomePage() {
  const club = await getClub()
  const serverNow = requestTime()
  const [upcoming, results, table, news, spotlight, videos, partners] = await Promise.all([
    getUpcomingMatches(),
    getRecentResults(3),
    getLeagueTable(club.currentSeason),
    getHomeNews(3),
    getSpotlight(club.home.spotlightIds),
    getLatestVideos(3),
    getPartners(),
  ])
  const next = upcoming.find(
    (m) =>
      m.status === 'scheduled' && new Date(m.kickoff).getTime() > serverNow - NEXT_MATCH_GRACE_MS,
  )
  const tableRows = table ? windowAroundClub(table.rows, 6) : []
  const [mainVideo, ...moreVideos] = videos
  const homePartners = partners.filter((p) => p.showOnHome).slice(0, 5)

  return (
    <>
      <JsonLd
        data={sportsTeamJsonLd({
          name: club.name,
          shortBio: club.shortBio,
          city: club.city,
          socials: club.socials,
          groundName: club.ground.name,
        })}
      />

      <section
        aria-labelledby="hero-title"
        className="relative overflow-hidden bg-night text-white"
      >
        {/* Phone: motif and crest sit behind the title, as in MobileHome.dc.html. */}
        <Motif
          variant="mobile"
          className="pointer-events-none absolute top-5 -right-[90px] h-auto w-[300px] md:hidden"
        />
        <Image
          src="/crest.png"
          alt=""
          width={170}
          height={193}
          loading="eager"
          className="pointer-events-none absolute top-[70px] -right-5 h-auto w-[170px] opacity-90 md:hidden"
          style={{ height: 'auto' }}
        />
        <div className="wrap relative flex flex-wrap items-center gap-10 pt-9 md:pt-16">
          <div className="min-w-0 flex-[1_1_560px]">
            <p className="m-0 mb-3 text-[15px] font-semibold text-cyan md:mb-4 md:text-[17px]">
              Official club website
            </p>
            <h1
              id="hero-title"
              className="m-0 font-display text-[84px] leading-[0.84] font-black tracking-[-0.01em] uppercase md:text-hero"
            >
              Ultimate
              <br />
              Rovers
            </h1>
            <p className="m-0 mt-[18px] max-w-[240px] text-[16px] leading-[1.5] text-mist-text md:mt-7 md:max-w-[520px] md:text-[19px] md:leading-[1.55]">
              {club.home.heroIntro}
            </p>
            <div className="mt-6 flex flex-col gap-2.5 md:mt-8 md:flex-row md:flex-wrap md:gap-3">
              <ButtonLink href="/fixtures" variant="primary-dark" size="lg">
                See fixtures
              </ButtonLink>
              <ButtonLink href="/squad" variant="outline-dark" size="lg">
                Meet the squad
              </ButtonLink>
            </div>
          </div>
          <div className="relative hidden min-h-[460px] min-w-0 flex-[1_1_380px] items-center justify-center md:flex">
            <Motif
              variant="home"
              className="pointer-events-none absolute inset-0 m-auto h-auto w-[460px] max-w-full"
            />
            <Image
              src="/crest.png"
              alt={`${club.name} crest`}
              width={300}
              height={341}
              loading="eager"
              fetchPriority="high"
              sizes="300px"
              className="relative block h-auto w-[300px] max-w-[70%]"
              style={{ height: 'auto' }}
            />
          </div>
        </div>
        {next ? (
          <div className="wrap relative pt-7 pb-7 md:pt-10 md:pb-14">
            <NextMatchStrip m={next} serverNow={serverNow} />
          </div>
        ) : (
          <div className="h-7 md:h-14" />
        )}
      </section>

      <section
        aria-labelledby="results-title"
        className="wrap flex flex-wrap gap-10 pt-9 pb-3 md:pt-20 md:pb-10"
      >
        <div className="min-w-0 flex-[999_1_560px]">
          <SectionHeader
            id="results-title"
            title="Recent results"
            href="/fixtures?view=results"
            linkLabel="All results"
            className="mb-3.5 md:mb-6"
          />
          {results.length > 0 ? (
            <>
              <div className="hidden grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 md:grid">
                {results.map((m) => (
                  <ResultCard key={m.id} m={m} />
                ))}
              </div>
              <div className="relative -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 scrollbar-thin md:hidden">
                {results.map((m) => (
                  <ResultCardCompact key={m.id} m={m} />
                ))}
              </div>
            </>
          ) : (
            <EmptyState>
              No results yet this season. The first match report will appear here.
            </EmptyState>
          )}
        </div>
        {tableRows.length > 0 && table ? (
          <aside
            aria-labelledby="table-title"
            className="min-w-0 flex-[1_1_340px] rounded-card border border-line bg-white p-[22px]"
          >
            <div className="mb-3 flex items-baseline justify-between">
              <h2 id="table-title" className="m-0 font-display text-[30px] font-extrabold">
                League table
              </h2>
              <Link href="/fixtures?view=table" className="text-[14px] font-semibold">
                Full table
              </Link>
            </div>
            <CompactTable
              rows={tableRows}
              caption={`${table.competition.name}, six places around ${club.name}`}
            />
          </aside>
        ) : null}
      </section>

      <section aria-labelledby="news-title" className="wrap pt-7 pb-7 md:pt-10 md:pb-20">
        <SectionHeader
          id="news-title"
          title="Latest news"
          href="/news"
          linkLabel="All news"
          className="mb-3.5 md:mb-6"
        />
        {news.featured ? (
          <div className="flex flex-wrap gap-3 md:gap-6">
            <NewsCardFeatured a={news.featured} className="min-w-0 flex-[999_1_520px]" />
            <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-2.5 md:gap-4">
              {news.rest.map((a, i) => (
                <div key={a.id} className={i === 2 ? 'hidden md:block' : undefined}>
                  <NewsCardCompact a={a} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState>No stories yet. News from the club will appear here.</EmptyState>
        )}
      </section>

      <section aria-labelledby="squad-title" className="bg-mist py-8 md:py-20">
        <div className="wrap">
          <SectionHeader
            id="squad-title"
            title="The squad"
            href="/squad"
            linkLabel="View full squad"
            className="mb-3.5 md:mb-6"
          />
          {spotlight.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] md:gap-5">
              {spotlight.map((p) => (
                <PlayerCardSpotlight key={p.id} p={p} />
              ))}
            </div>
          ) : (
            <EmptyState>The squad for the new season will be announced soon.</EmptyState>
          )}
        </div>
      </section>

      {mainVideo ? (
        <section aria-labelledby="watch-title" className="bg-night py-8 text-white md:py-20">
          <div className="wrap">
            <h2
              id="watch-title"
              className="m-0 mb-3.5 font-display text-[36px] leading-none font-black md:mb-6 md:text-section"
            >
              Watch
            </h2>
            <div className="flex flex-wrap gap-6">
              <div className="min-w-0 flex-[999_1_560px]">
                <VideoEmbed
                  title={mainVideo.title}
                  url={mainVideo.url}
                  fileUrl={mainVideo.fileUrl}
                  poster={mainVideo.poster}
                  size="lg"
                  tone="raised"
                  rounded="rounded-card md:rounded-[14px]"
                />
                <p className="m-0 mt-2.5 text-[16px] font-bold md:mt-3.5 md:text-[20px]">
                  {mainVideo.title}
                </p>
                {formatDuration(mainVideo.durationSeconds) ? (
                  <p className="m-0 mt-1 text-[14px] text-mist-text">
                    {formatDuration(mainVideo.durationSeconds)}
                  </p>
                ) : null}
              </div>
              {moreVideos.length > 0 ? (
                <div className="hidden min-w-0 flex-[1_1_300px] flex-col gap-5 md:flex">
                  {moreVideos.map((v) => (
                    <div key={v.id}>
                      <VideoEmbed
                        title={v.title}
                        url={v.url}
                        fileUrl={v.fileUrl}
                        poster={v.poster}
                        size="sm"
                        tone="raised"
                        rounded="rounded-card"
                      />
                      <p className="m-0 mt-2.5 text-[16px] font-bold">{v.title}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section
        aria-labelledby="crest-title"
        className="wrap flex flex-wrap items-center gap-12 py-14 md:py-[88px]"
      >
        <div className="flex flex-[0_1_300px] justify-center">
          <Image
            src="/crest.png"
            alt={`${club.name} crest`}
            width={240}
            height={273}
            sizes="240px"
            className="h-auto w-[180px] md:w-[240px]"
            style={{ height: 'auto' }}
          />
        </div>
        <div className="min-w-0 flex-[1_1_520px]">
          <h2
            id="crest-title"
            className="m-0 font-display text-[40px] leading-none font-black md:text-section"
          >
            More than a badge
          </h2>
          <p className="m-0 mt-[18px] max-w-[620px] text-lead leading-[1.6] text-ink-soft">
            {club.home.crestStory ??
              'Our crest carries a triskele at the heart of the ball and a balance mark beneath the name.'}
          </p>
          <ButtonLink href="/club" variant="primary-light" className="mt-6">
            Our story
          </ButtonLink>
        </div>
      </section>

      {homePartners.length > 0 ? (
        <section aria-labelledby="partners-title" className="border-t border-line bg-white py-12">
          <div className="wrap">
            <h2
              id="partners-title"
              className="m-0 mb-5 text-center text-[16px] font-semibold text-slate"
            >
              Our partners
            </h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(160px,100%),1fr))] gap-4">
              {homePartners.map((p) => (
                <PartnerLogo key={p.id} partner={p} className="h-[72px]" />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
