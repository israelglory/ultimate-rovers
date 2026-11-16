import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { TrophyIcon } from '@/components/ui/icons'
import { Motif } from '@/components/ui/Motif'
import { getClub } from '@/lib/data/club'
import { getHonours, getTimeline } from '@/lib/data/content'
import { formatNumber } from '@/lib/format'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const club = await getClub()
  return pageMetadata({
    title: 'Our club',
    description:
      club.about.intro ?? `The story, crest, values, honours and home ground of ${club.name}.`,
    path: '/club',
  })
}

const h2 = 'm-0 font-display text-[40px] leading-none font-black md:text-section'

export default async function AboutPage() {
  const [club, timeline, honours] = await Promise.all([getClub(), getTimeline(), getHonours()])
  const a = club.about
  const g = club.ground
  const groundRows: Array<[string, string | null]> = [
    ['Stadium', g.name],
    ['Address', [g.street, g.city, g.postcode].filter(Boolean).join(', ') || null],
    ['Capacity', g.capacity ? formatNumber(g.capacity) : null],
    ['Surface', g.surface],
    ['Accessible entry', g.accessibleEntry],
  ]

  return (
    <>
      <section aria-labelledby="ab-title" className="overflow-hidden bg-night text-white">
        <div className="wrap flex flex-wrap items-center gap-12 py-16">
          <div className="min-w-0 flex-[1_1_560px]">
            <h1
              id="ab-title"
              className="m-0 font-display text-[clamp(56px,8vw,112px)] leading-[0.88] font-black"
            >
              Our club
            </h1>
            {a.intro ? (
              <p className="m-0 mt-5 max-w-[580px] text-[20px] leading-[1.55] text-mist-text">
                {a.intro}
              </p>
            ) : null}
          </div>
          <div className="relative flex flex-[0_1_320px] justify-center">
            <Motif
              variant="about"
              className="pointer-events-none absolute inset-0 m-auto h-auto w-[340px] max-w-full"
            />
            <Image
              src="/crest.png"
              alt={`${club.name} crest`}
              width={240}
              height={273}
              sizes="240px"
              loading="eager"
              className="relative h-auto w-[200px] sm:w-[240px]"
              style={{ height: 'auto' }}
            />
          </div>
        </div>
      </section>

      <div className="wrap flex flex-col gap-[88px] pt-[72px] pb-20">
        <section aria-labelledby="story-title" className="flex flex-wrap gap-12">
          <div className="min-w-0 flex-[1_1_380px]">
            <h2 id="story-title" className={h2}>
              Our story
            </h2>
            {a.story.map((p, i) => (
              <p
                key={i}
                className={`m-0 text-lead leading-[1.65] text-ink-soft ${i === 0 ? 'mt-4' : 'mt-3.5'}`}
              >
                {p}
              </p>
            ))}
          </div>
          {timeline.length > 0 ? (
            <ol className="m-0 min-w-0 flex-[999_1_520px] list-none p-0" aria-label="Club timeline">
              {timeline.map((t) => (
                <li
                  key={t.id}
                  className="grid grid-cols-[72px_minmax(0,1fr)] gap-4 pb-7 sm:grid-cols-[96px_minmax(0,1fr)] sm:gap-5"
                >
                  <span className="font-display text-[32px] leading-none font-black text-navy">
                    {t.year}
                  </span>
                  <div className="border-l-2 border-cyan pl-5">
                    <p className="m-0 text-[18px] font-bold">{t.title}</p>
                    {t.text ? (
                      <p className="m-0 mt-1.5 text-[15px] leading-normal text-slate">{t.text}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          ) : null}
        </section>

        {a.crestElements.length > 0 ? (
          <section aria-labelledby="crest-title">
            <h2 id="crest-title" className={`${h2} mb-2`}>
              Reading the crest
            </h2>
            <p className="m-0 mb-7 max-w-[620px] text-[17px] leading-[1.55] text-slate">
              Four elements, one identity.
            </p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-4">
              {a.crestElements.map((c) => (
                <article key={c.title} className="rounded-[14px] border border-line bg-white p-6">
                  <h3 className="m-0 font-display text-[30px] leading-none font-extrabold">
                    {c.title}
                  </h3>
                  <p className="m-0 mt-2 text-[15px] leading-[1.55] text-slate">{c.text}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {a.mission || a.vision || a.values ? (
          <section
            aria-labelledby="mission-title"
            className="rounded-panel bg-night p-7 text-white md:p-12"
          >
            <h2 id="mission-title" className={`${h2} mb-7`}>
              What we stand for
            </h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-8">
              {(
                [
                  ['Mission', a.mission],
                  ['Vision', a.vision],
                  ['Values', a.values],
                ] as const
              )
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k}>
                    <h3 className="m-0 text-[18px] text-cyan">{k}</h3>
                    <p className="m-0 mt-2.5 text-[18px] leading-[1.55]">{v}</p>
                  </div>
                ))}
            </div>
          </section>
        ) : null}

        <section aria-labelledby="honours-title">
          <h2 id="honours-title" className={`${h2} mb-6`}>
            Honours
          </h2>
          {honours.length > 0 ? (
            <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-4 p-0">
              {honours.map((h) => (
                <li
                  key={h.id}
                  className="flex flex-col gap-2.5 rounded-[14px] border border-line bg-white p-6"
                >
                  <TrophyIcon className="text-navy" />
                  <span className="font-display text-[48px] leading-none font-black text-navy">
                    {h.count}
                  </span>
                  <span className="text-[17px] font-bold">{h.competition}</span>
                  {h.years ? <span className="text-[14px] text-slate">{h.years}</span> : null}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>The club&apos;s honours will be listed here.</EmptyState>
          )}
        </section>

        <section
          id="ground"
          aria-labelledby="ground-title"
          className="flex scroll-mt-4 flex-wrap items-stretch gap-8"
        >
          <div className="relative flex aspect-[16/10] min-w-0 flex-[999_1_560px] items-center justify-center overflow-hidden rounded-feature bg-line text-[15px] text-slate">
            {g.photo ? (
              <Image
                src={g.photo.url}
                alt={g.photo.alt}
                fill
                sizes="(max-width: 900px) 100vw, 800px"
                className="object-cover"
              />
            ) : (
              <span aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0 flex-[1_1_340px]">
            <h2 id="ground-title" className={h2}>
              Our home ground
            </h2>
            <dl className="m-0 mt-5 grid grid-cols-[max-content_minmax(0,1fr)] gap-x-5 gap-y-3 text-[16px]">
              {groundRows
                .filter((r): r is [string, string] => Boolean(r[1]))
                .map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-slate">{k}</dt>
                    <dd className="m-0 font-bold">{v}</dd>
                  </div>
                ))}
            </dl>
            {g.mapUrl ? (
              <ButtonLink href={g.mapUrl} variant="primary-light" className="mt-6" rel="noopener">
                Get directions
              </ButtonLink>
            ) : null}
          </div>
        </section>

        <section
          aria-label="Academy and community"
          className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-5"
        >
          {(
            [
              [
                'Academy',
                a.academyText,
                a.academyImage,
                '/contact?topic=academy',
                'Register for trials',
              ],
              [
                'Community',
                a.communityText,
                a.communityImage,
                '/news?category=community',
                'See community news',
              ],
            ] as const
          ).map(([title, text, image, href, cta]) => (
            <article
              key={title}
              className="overflow-hidden rounded-feature border border-line bg-white"
            >
              <div className="relative aspect-[16/7] bg-line">
                {image ? (
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 700px) 100vw, 620px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="p-7">
                <h2 className="m-0 font-display text-[40px] leading-none font-black">{title}</h2>
                {text ? (
                  <p className="mt-2.5 mb-[18px] text-[16px] leading-[1.55] text-slate">{text}</p>
                ) : (
                  <div className="h-4" />
                )}
                <Link href={href} className="text-[15px] font-bold">
                  {cta}
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section
          aria-labelledby="join-title"
          className="flex flex-wrap items-center justify-between gap-6 rounded-panel bg-cyan px-7 py-9 text-night md:px-12 md:py-11"
        >
          <div className="max-w-[620px]">
            <h2 id="join-title" className={h2}>
              Become a member
            </h2>
            <p className="m-0 mt-2.5 text-[17px] leading-[1.55]">
              {a.membershipText ??
                'Member events, club news first and a vote at the annual general meeting.'}
            </p>
          </div>
          <ButtonLink href="/contact?topic=membership" variant="night" size="lg">
            Join the club
          </ButtonLink>
        </section>
      </div>
    </>
  )
}
