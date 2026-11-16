import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { NewsCardGrid } from '@/components/content/NewsCard'
import { RichText } from '@/components/content/RichText'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { ShareButton } from '@/components/ui/ShareButton'
import { categoryChipLabels, getArticle, getRelatedArticles } from '@/lib/data/articles'
import { getClub } from '@/lib/data/club'
import { formatDate } from '@/lib/format'
import { absoluteUrl } from '@/lib/site'
import { newsArticleJsonLd, pageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const a = await getArticle(slug)
  if (!a) return { title: 'Story not found' }
  return pageMetadata({
    title: a.title,
    description: a.standfirst,
    path: `/news/${slug}`,
    type: 'article',
    image: a.heroImage ? absoluteUrl(a.heroImage.url) : undefined,
  })
}

/** Article page, built from the Report tab layout in MatchCentre.dc.html. */
export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const a = await getArticle(slug)
  if (!a) notFound()
  const [club, related] = await Promise.all([getClub(), getRelatedArticles(a.category, a.id)])

  return (
    <>
      <JsonLd
        data={newsArticleJsonLd({
          title: a.title,
          standfirst: a.standfirst,
          slug: a.slug,
          publishedAt: a.publishedAt,
          author: a.author,
          image: a.heroImage ? absoluteUrl(a.heroImage.url) : undefined,
          clubName: club.name,
        })}
      />
      <Breadcrumbs
        items={[
          { label: 'News', href: '/news' },
          { label: categoryChipLabels[a.category], href: `/news?category=${a.category}` },
          { label: a.title },
        ]}
      />
      <div className="wrap pt-12 pb-20">
        <article aria-labelledby="article-title" className="mx-auto w-full max-w-[760px]">
          <p className="m-0 text-[14px] font-semibold text-navy">
            {a.categoryLabel}, <time dateTime={a.publishedAt}>{formatDate(a.publishedAt)}</time>
            {a.author ? `, by ${a.author}` : ''}
          </p>
          <h1
            id="article-title"
            className="mt-2.5 mb-0 font-display text-[40px] leading-[0.98] font-black sm:text-[56px]"
          >
            {a.title}
          </h1>
          <p className="mt-[18px] mb-0 text-[20px] leading-[1.6] text-ink-soft">{a.standfirst}</p>
          {a.heroImage ? (
            <Image
              src={a.heroImage.url}
              alt={a.heroImage.alt}
              width={a.heroImage.width}
              height={a.heroImage.height}
              sizes="(max-width: 800px) 100vw, 760px"
              loading="eager"
              fetchPriority="high"
              className="mt-7 aspect-video w-full rounded-[14px] object-cover"
            />
          ) : (
            <div aria-hidden="true" className="mt-7 aspect-video rounded-[14px] bg-line" />
          )}
          <RichText value={a.body} className="mt-7" />
          {a.relatedMatchSlug || a.relatedPlayers.length > 0 ? (
            <aside
              aria-label="Related"
              className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-5 text-[15px]"
            >
              {a.relatedMatchSlug ? (
                <Link href={`/matches/${a.relatedMatchSlug}`} className="font-bold">
                  Match centre
                </Link>
              ) : null}
              {a.relatedPlayers.map((p) => (
                <Link key={p.slug} href={`/squad/${p.slug}`} className="font-bold">
                  {p.name}
                </Link>
              ))}
            </aside>
          ) : null}
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <Link href={`/news?category=${a.category}`} className="text-[15px] font-bold">
              More {categoryChipLabels[a.category].toLowerCase()}
            </Link>
            <ShareButton
              title={a.title}
              style={{ variant: 'secondary', size: 'sm', px: 'px-[18px]' }}
            />
          </div>
        </article>

        {related.length > 0 ? (
          <section aria-labelledby="related-title" className="mt-20">
            <h2
              id="related-title"
              className="m-0 mb-6 font-display text-[40px] leading-none font-black md:text-[48px]"
            >
              Read next
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-6">
              {related.map((r) => (
                <NewsCardGrid key={r.id} a={r} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  )
}
