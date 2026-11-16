import type { Metadata } from 'next'

import { PartnerLogo } from '@/components/content/PartnerLogo'
import { PersonCard } from '@/components/content/PersonCard'
import { PageHero } from '@/components/layout/PageHero'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { DocumentIcon } from '@/components/ui/icons'
import { getClub } from '@/lib/data/club'
import { getDocuments, getPartners, getPeople, type PeopleGroup } from '@/lib/data/content'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: 'The people behind the club',
    description:
      'The board, management, technical staff, investors and partners of Ultimate Rovers, and the club’s governance documents.',
    path: '/club/stakeholders',
  })
}

const groups: Array<{ id: PeopleGroup; title: string; chip: string; blurb: string }> = [
  {
    id: 'board',
    title: 'Board of directors',
    chip: 'Board',
    blurb: 'Sets the club’s direction and holds management to account.',
  },
  {
    id: 'management',
    title: 'Club management',
    chip: 'Management',
    blurb: 'Runs the club day to day, from operations to media.',
  },
  {
    id: 'technical',
    title: 'Technical and medical staff',
    chip: 'Technical and medical',
    blurb: 'Coaches the squad and keeps players fit to play.',
  },
  {
    id: 'investors',
    title: 'Investors and patrons',
    chip: 'Investors and patrons',
    blurb: 'Shareholders and patrons who fund the club’s growth.',
  },
]

const tiers = [
  { tier: 'official', title: 'Official partners' },
  { tier: 'supplier', title: 'Official suppliers' },
  { tier: 'community', title: 'Community partners' },
] as const

const sectionHead =
  'mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b-2 border-night pb-3'
const h2 = 'm-0 font-display text-[40px] leading-none font-black md:text-[48px]'

const formatSize = (bytes: number | null) =>
  bytes ? ` (PDF, ${Math.max(1, Math.round(bytes / 1024))} KB)` : ' (PDF)'

export default async function StakeholdersPage() {
  const [club, people, partners, documents] = await Promise.all([
    getClub(),
    getPeople(),
    getPartners(),
    getDocuments(),
  ])
  const principal = partners.find((p) => p.tier === 'principal')

  return (
    <>
      <PageHero
        id="st-title"
        title="The people behind the club"
        intro={`The board, management, technical staff, investors and partners who keep ${club.name} moving.`}
        introClassName="max-w-[600px]"
      >
        <nav aria-label="On this page" className="mt-7 flex flex-wrap gap-2">
          {[
            ...groups.map((g) => ({ id: g.id, label: g.chip })),
            { id: 'partners', label: 'Partners' },
            { id: 'governance', label: 'Governance' },
          ].map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className="inline-flex min-h-touch items-center rounded-pill border border-border-dark px-4 text-[14px] font-semibold text-white no-underline hover:border-cyan hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </PageHero>

      <div className="wrap flex flex-col gap-[72px] pt-14 pb-[72px]">
        {groups.map((g) => (
          <section key={g.id} id={g.id} aria-labelledby={`${g.id}-title`} className="scroll-mt-4">
            <div className={sectionHead}>
              <h2 id={`${g.id}-title`} className={h2}>
                {g.title}
              </h2>
              <p className="m-0 max-w-[520px] text-[15px] text-slate">{g.blurb}</p>
            </div>
            {people[g.id].length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] sm:gap-4">
                {people[g.id].map((p) => (
                  <PersonCard key={p.id} person={p} />
                ))}
              </div>
            ) : (
              <EmptyState>No one listed here yet.</EmptyState>
            )}
          </section>
        ))}

        <section id="partners" aria-labelledby="partners-title" className="scroll-mt-4">
          <div className={sectionHead}>
            <h2 id="partners-title" className={h2}>
              Partners and sponsors
            </h2>
            <p className="m-0 max-w-[520px] text-[15px] text-slate">
              The brands and organisations that back the club on and off the pitch.
            </p>
          </div>
          {partners.length === 0 ? (
            <EmptyState>Partner announcements will appear here.</EmptyState>
          ) : (
            <div className="flex flex-col gap-7">
              {principal ? (
                <div>
                  <h3 className="m-0 mb-3 text-[18px]">Principal partner</h3>
                  <div className="flex min-h-[180px] flex-wrap items-center justify-between gap-5 rounded-[14px] bg-night px-6 py-7 text-mist-text md:px-8">
                    <PartnerLogo
                      partner={{ ...principal, url: null }}
                      tone="dark"
                      className="h-24 flex-[0_1_280px] text-[15px]"
                    />
                    {principal.blurb ? (
                      <p className="m-0 flex-[1_1_360px] text-[16px] leading-[1.55]">
                        {principal.blurb}
                      </p>
                    ) : null}
                    {principal.url ? (
                      <ButtonLink
                        href={principal.url}
                        variant="outline-cyan"
                        size="sm"
                        px="px-[18px]"
                        rel="noopener sponsored"
                      >
                        Visit partner<span className="sr-only">: {principal.name}</span>
                      </ButtonLink>
                    ) : null}
                  </div>
                </div>
              ) : null}
              {tiers.map((t) => {
                const list = partners.filter((p) => p.tier === t.tier)
                if (list.length === 0) return null
                return (
                  <div key={t.tier}>
                    <h3 className="m-0 mb-3 text-[18px]">{t.title}</h3>
                    <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(200px,100%),1fr))] gap-3 p-0">
                      {list.map((p) => (
                        <li key={p.id}>
                          <PartnerLogo partner={p} className="h-24 bg-white" />
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section
          id="governance"
          aria-labelledby="gov-title"
          className="flex scroll-mt-4 flex-wrap gap-6"
        >
          <div className="min-w-0 flex-[999_1_520px]">
            <h2 id="gov-title" className={`${h2} mb-3`}>
              Governance
            </h2>
            <p className="m-0 mb-5 max-w-[560px] text-[16px] leading-[1.55] text-slate">
              Club documents for members, investors and partners.
            </p>
            {documents.length > 0 ? (
              <ul className="m-0 list-none rounded-card border border-line bg-white p-0 [&>li+li]:border-t [&>li+li]:border-line">
                {documents.map((d) => (
                  <li key={d.id} className="flex items-center gap-3.5 px-[18px] py-3">
                    <DocumentIcon className="shrink-0 text-navy" />
                    <span className="flex-auto font-semibold">{d.title}</span>
                    <a
                      href={d.url}
                      download
                      className="inline-flex min-h-touch items-center text-[14px] font-semibold"
                    >
                      Download PDF
                      <span className="sr-only">
                        : {d.title}
                        {formatSize(d.filesize)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState>Club documents will be published here.</EmptyState>
            )}
          </div>
          <div className="flex min-w-0 flex-[1_1_320px] flex-col justify-between gap-5 rounded-feature bg-night p-8 text-white">
            <div>
              <h2 className="m-0 font-display text-[40px] leading-none font-black">
                Partner with us
              </h2>
              <p className="m-0 mt-3 text-[16px] leading-[1.55] text-mist-text">
                {club.partnershipText ??
                  'Shirt, stadium, digital and community packages are open for the season.'}
              </p>
            </div>
            <ButtonLink
              href="/contact?topic=partnerships"
              variant="primary-dark"
              className="self-start"
            >
              Talk to our commercial team
            </ButtonLink>
          </div>
        </section>
      </div>
    </>
  )
}
