import { RichText } from '@/components/content/RichText'
import { EmptyState } from '@/components/ui/EmptyState'
import type { RichTextValue } from '@/lib/types'

import { PageHero } from './PageHero'

/** Long-form legal page: PageHero plus the report body styles. */
export function LegalPage({
  id,
  title,
  intro,
  body,
}: {
  id: string
  title: string
  intro: string
  body: RichTextValue | null
}) {
  return (
    <>
      <PageHero id={id} title={title} intro={intro} />
      <div className="wrap pt-12 pb-20">
        <div className="mx-auto max-w-[760px]">
          {body ? (
            <RichText value={body} />
          ) : (
            <EmptyState>
              This page is being written. Please contact us with any questions in the meantime.
            </EmptyState>
          )}
        </div>
      </div>
    </>
  )
}
