import type { Metadata } from 'next'

import { ContactForm } from '@/components/forms/ContactForm'
import { PageHero } from '@/components/layout/PageHero'
import { Accordion } from '@/components/ui/Accordion'
import { PinIcon } from '@/components/ui/icons'
import { getClub } from '@/lib/data/club'
import { parseContactParams } from '@/lib/search-params'
import { pageMetadata } from '@/lib/seo'

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: 'Contact us',
    description:
      'Tickets, partnerships, media, trials or anything else. Contact the right team at Ultimate Rovers.',
    path: '/contact',
  })
}

/** Digits and a leading + only, so placeholder numbers never become broken tel: links. */
const telHref = (phone: string) => {
  const digits = phone.replace(/[^\d+]/g, '')
  return digits.replace(/\D/g, '').length >= 6 ? `tel:${digits}` : null
}

export default async function ContactPage({ searchParams }: Props) {
  const { topic } = parseContactParams(await searchParams)
  const club = await getClub()
  const cards = club.departments.filter((d) => d.showCard)
  const g = club.ground
  const tel = club.phone ? telHref(club.phone) : null

  return (
    <>
      <PageHero
        id="ct-title"
        title="Contact us"
        intro="Tickets, partnerships, media, trials or anything else. Pick a team below or send us a message."
      />

      <div className="wrap flex flex-col gap-[72px] pt-14 pb-20">
        {cards.length > 0 ? (
          <section
            aria-label="Departments"
            className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-4"
          >
            {cards.map((d) => (
              <article
                key={d.topic}
                className="rounded-[14px] border border-line bg-white p-[22px]"
              >
                <h2 className="m-0 text-[19px]">{d.title}</h2>
                {d.text ? (
                  <p className="mt-2 mb-3.5 text-[15px] leading-normal text-slate">{d.text}</p>
                ) : (
                  <div className="h-3.5" />
                )}
                <a
                  href={`mailto:${d.email}`}
                  className="inline-flex min-h-touch items-center text-[15px] font-bold break-all"
                >
                  {d.email}
                </a>
              </article>
            ))}
          </section>
        ) : null}

        <section aria-labelledby="form-title" className="flex flex-wrap gap-10">
          <div className="min-w-0 flex-[999_1_560px] rounded-feature border border-line bg-white p-5 sm:p-8">
            <h2
              id="form-title"
              className="m-0 mb-5 font-display text-[36px] leading-none font-black sm:text-[44px]"
            >
              Send a message
            </h2>
            <ContactForm topic={topic} replyDays={club.replyDays} />
          </div>

          <aside aria-label="Club office" className="flex min-w-0 flex-[1_1_340px] flex-col gap-4">
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-feature bg-line text-[14px] text-slate">
              {g.mapEmbedUrl ? (
                <iframe
                  src={g.mapEmbedUrl}
                  title={`Map of ${g.name ?? 'the ground'}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 size-full border-0"
                />
              ) : (
                <>
                  <PinIcon className="text-navy" />
                  {g.mapUrl ? (
                    <a
                      href={g.mapUrl}
                      rel="noopener"
                      className="absolute bottom-3 left-3.5 font-semibold"
                    >
                      Open in maps
                    </a>
                  ) : null}
                </>
              )}
            </div>
            <div className="rounded-feature bg-night p-[26px] text-white">
              <h2 className="m-0 text-[19px]">Club office</h2>
              <address className="mt-2.5 text-[15px] leading-[1.6] text-mist-text not-italic">
                {[g.name, g.street, [g.city, club.country].filter(Boolean).join(', ')]
                  .filter(Boolean)
                  .map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
              </address>
              {club.officeHours || club.matchdayHours ? (
                <>
                  <h3 className="mt-5 mb-0 text-[16px]">Opening hours</h3>
                  <p className="m-0 mt-1.5 text-[15px] leading-[1.6] text-mist-text">
                    {club.officeHours ? <span className="block">{club.officeHours}</span> : null}
                    {club.matchdayHours ? (
                      <span className="block">{club.matchdayHours}</span>
                    ) : null}
                  </p>
                </>
              ) : null}
              {club.phone ? (
                tel ? (
                  <a
                    href={tel}
                    className="mt-3.5 inline-flex min-h-touch items-center text-[16px] font-bold text-cyan hover:text-white"
                  >
                    {club.phone}
                  </a>
                ) : (
                  <p className="m-0 mt-3.5 flex min-h-touch items-center text-[16px] font-bold text-cyan">
                    {club.phone}
                  </p>
                )
              ) : null}
            </div>
          </aside>
        </section>

        {club.faqs.length > 0 ? (
          <section aria-labelledby="faq-title" className="max-w-[880px]">
            <h2
              id="faq-title"
              className="m-0 mb-5 font-display text-[40px] leading-none font-black md:text-section"
            >
              Common questions
            </h2>
            <Accordion items={club.faqs} />
          </section>
        ) : null}
      </div>
    </>
  )
}
