import type { Metadata } from 'next'

import { PageHero } from '@/components/layout/PageHero'
import { ButtonLink } from '@/components/ui/Button'

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } }

export default function NotFound() {
  return (
    <>
      <PageHero
        id="nf-title"
        title="Page not found"
        intro="The page you were looking for has moved or never existed. Try one of these instead."
      >
        <div className="mt-7 flex flex-wrap gap-3">
          <ButtonLink href="/" variant="primary-dark">
            Home
          </ButtonLink>
          <ButtonLink href="/fixtures" variant="outline-dark">
            Fixtures
          </ButtonLink>
          <ButtonLink href="/squad" variant="outline-dark">
            Squad
          </ButtonLink>
        </div>
      </PageHero>
      <div className="h-20" />
    </>
  )
}
