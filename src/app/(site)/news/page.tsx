import type { Metadata } from 'next'

import { NewsCardGrid, NewsCardWide } from '@/components/content/NewsCard'
import { PageHero } from '@/components/layout/PageHero'
import { EmptyState } from '@/components/ui/EmptyState'
import { FilterChip } from '@/components/ui/FilterChip'
import { Pagination } from '@/components/ui/Pagination'
import { ParamForm } from '@/components/ui/ParamForm'
import { categoryChipLabels, listArticles } from '@/lib/data/articles'
import { newsCategories, parseNewsParams, toQuery } from '@/lib/search-params'
import { pageMetadata } from '@/lib/seo'

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { category, q, page } = parseNewsParams(await searchParams)
  return pageMetadata({
    title: category ? `${categoryChipLabels[category]}: club news` : 'Club news',
    description: 'Match reports, squad news, academy and community stories from Ultimate Rovers.',
    path: `/news${toQuery({ category, page: page > 1 ? page : undefined })}`,
    noIndex: Boolean(q),
  })
}

export default async function NewsPage({ searchParams }: Props) {
  const { category, q, page } = parseNewsParams(await searchParams)
  const list = await listArticles({ category, q, page })
  const chips = [
    { value: '', label: 'All news' },
    ...newsCategories.map((c) => ({ value: c, label: categoryChipLabels[c] })),
  ]
  const empty = !list.featured && list.items.length === 0

  return (
    <>
      <PageHero
        id="nw-title"
        title="Club news"
        aside={
          <div className="flex min-w-0 flex-[0_1_340px] flex-col gap-1.5" role="search">
            <label htmlFor="news-search" className="text-[14px] text-mist-text">
              Search news
            </label>
            <input
              id="news-search"
              form="news-filters"
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Player, match or topic"
              className="min-h-[46px] rounded-button border border-border-dark bg-navy px-3.5 text-[15px] text-white placeholder:text-mist-text"
            />
          </div>
        }
      >
        <ParamForm id="news-filters" aria-label="Filter news" className="mt-7">
          <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <FilterChip
                key={c.label}
                name="category"
                value={c.value}
                on={(category ?? '') === c.value}
              >
                {c.label}
              </FilterChip>
            ))}
          </div>
          {/* After the chips: a pressed chip's value comes first and wins; a search keeps the category. */}
          <input type="hidden" name="category" value={category ?? ''} />
          <button type="submit" className="sr-only">
            Search
          </button>
        </ParamForm>
      </PageHero>

      <div className="wrap pt-12 pb-20">
        {q ? (
          <p className="m-0 mb-6 text-[16px] text-slate" role="status">
            {list.total} {list.total === 1 ? 'story' : 'stories'} matching “{q}”
          </p>
        ) : null}
        {list.featured ? <NewsCardWide a={list.featured} /> : null}
        {list.items.length > 0 ? (
          <>
            {list.featured ? (
              <h2 className="sr-only">More stories</h2>
            ) : (
              <h2 className="sr-only">Stories</h2>
            )}
            <div
              className={`grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-6 ${list.featured ? 'mt-10' : ''}`}
            >
              {list.items.map((a) => (
                <NewsCardGrid key={a.id} a={a} />
              ))}
            </div>
          </>
        ) : null}
        {empty ? (
          <EmptyState>
            {q
              ? `No stories match “${q}”. Try another search or choose All news.`
              : 'No stories in this category yet. Choose All news to see everything.'}
          </EmptyState>
        ) : null}
        <Pagination
          page={list.page}
          totalPages={list.totalPages}
          hrefFor={(p) => `/news${toQuery({ category, q, page: p > 1 ? p : undefined })}`}
        />
      </div>
    </>
  )
}
