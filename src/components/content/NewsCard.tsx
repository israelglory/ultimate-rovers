import Image from 'next/image'
import Link from 'next/link'

import { ImageIcon } from '@/components/ui/icons'
import { cn } from '@/lib/cn'
import type { ArticleCard } from '@/lib/data/articles'
import { formatDate } from '@/lib/format'

const href = (a: ArticleCard) => `/news/${a.slug}`

function Picture({
  a,
  sizes,
  className,
  priority,
}: {
  a: ArticleCard
  sizes: string
  className: string
  priority?: boolean
}) {
  if (a.heroImage) {
    return (
      <div className={cn('relative overflow-hidden', className)}>
        <Image
          src={a.heroImage.url}
          alt=""
          fill
          sizes={sizes}
          loading={priority ? 'eager' : undefined}
          className="object-cover"
        />
      </div>
    )
  }
  return <div aria-hidden="true" className={className} />
}

/** Lead story on Home: navy card, 16:9 image above. */
export function NewsCardFeatured({ a, className }: { a: ArticleCard; className?: string }) {
  return (
    <Link
      href={href(a)}
      className={cn(
        'flex flex-col overflow-hidden rounded-[14px] bg-navy text-white no-underline hover:text-white',
        className,
      )}
    >
      {a.heroImage ? (
        <Picture
          a={a}
          sizes="(max-width: 768px) 100vw, 800px"
          className="aspect-video bg-navy-soft"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex aspect-video items-center justify-center bg-navy-soft text-mist-text"
        >
          <ImageIcon />
        </div>
      )}
      <div className="p-4 md:px-[26px] md:pt-6 md:pb-7">
        <p className="m-0 mb-1.5 text-[13px] font-semibold text-cyan md:mb-2 md:text-[14px]">
          {a.categoryLabel}
        </p>
        <h3 className="m-0 font-display text-[28px] leading-[1.02] font-extrabold md:text-[38px]">
          {a.title}
        </h3>
        <p className="m-0 mt-3 hidden text-[16px] leading-[1.55] text-mist-text md:block">
          {a.standfirst}
        </p>
      </div>
    </Link>
  )
}

/** Wide lead story on News: image left, text right. */
export function NewsCardWide({ a }: { a: ArticleCard }) {
  return (
    <Link
      href={href(a)}
      className="flex flex-wrap overflow-hidden rounded-feature bg-navy text-white no-underline hover:text-white"
    >
      {a.heroImage ? (
        <Picture
          a={a}
          sizes="(max-width: 960px) 100vw, 800px"
          className="min-h-[220px] flex-[999_1_560px] bg-navy-soft md:min-h-[360px]"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex min-h-[220px] flex-[999_1_560px] items-center justify-center bg-navy-soft text-mist-text md:min-h-[360px]"
        >
          <ImageIcon />
        </div>
      )}
      <div className="flex flex-[1_1_380px] flex-col justify-center p-6 md:p-9">
        <p className="m-0 mb-2.5 text-[14px] font-semibold text-cyan">
          {a.categoryLabel}, <time dateTime={a.publishedAt}>{formatDate(a.publishedAt)}</time>
        </p>
        <h2 className="m-0 font-display text-[34px] leading-[0.98] font-black md:text-[46px]">
          {a.title}
        </h2>
        <p className="m-0 mt-3.5 text-[16px] leading-[1.55] text-mist-text">{a.standfirst}</p>
        <span className="mt-5 font-bold text-white" aria-hidden="true">
          Read the story
        </span>
      </div>
    </Link>
  )
}

/** Compact card with a thumbnail on the left (Home). */
export function NewsCardCompact({ a, showDate = true }: { a: ArticleCard; showDate?: boolean }) {
  return (
    <Link
      href={href(a)}
      className="flex items-center gap-3 rounded-card border border-line bg-white p-2.5 text-ink no-underline hover:border-navy hover:text-ink md:gap-4 md:p-3.5"
    >
      <Picture
        a={a}
        sizes="120px"
        className="aspect-[4/3] flex-[0_0_92px] rounded-lg bg-line md:flex-[0_0_120px]"
      />
      <div className="min-w-0">
        <p className="m-0 mb-1 text-[12px] font-semibold text-navy md:text-[13px]">
          {a.categoryLabel}
        </p>
        <h3 className="m-0 text-[15px] leading-[1.3] font-bold md:text-[17px]">{a.title}</h3>
        {showDate ? (
          <p className="m-0 mt-1.5 hidden text-[13px] text-slate md:block">
            <time dateTime={a.publishedAt}>{formatDate(a.publishedAt)}</time>
          </p>
        ) : null}
      </div>
    </Link>
  )
}

/** Grid card on News and under articles. */
export function NewsCardGrid({
  a,
  headingLevel = 'h3',
}: {
  a: ArticleCard
  headingLevel?: 'h2' | 'h3'
}) {
  const Heading = headingLevel
  return (
    <Link
      href={href(a)}
      className="flex flex-col overflow-hidden rounded-[14px] border border-line bg-white text-ink no-underline hover:border-navy hover:text-ink"
    >
      <Picture a={a} sizes="(max-width: 700px) 100vw, 400px" className="aspect-video bg-line" />
      <div className="flex flex-auto flex-col gap-2 px-5 pt-[18px] pb-[22px]">
        <p className="m-0 text-[13px] font-semibold text-navy">{a.categoryLabel}</p>
        <Heading className="m-0 text-[19px] leading-[1.3]">{a.title}</Heading>
        <p className="m-0 mt-auto pt-2 text-[13px] text-slate">
          <time dateTime={a.publishedAt}>{formatDate(a.publishedAt)}</time>, {a.readMinutes} min
          read
        </p>
      </div>
    </Link>
  )
}
