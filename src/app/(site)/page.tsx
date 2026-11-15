import { PageHero } from '@/components/layout/PageHero'
import { ButtonLink } from '@/components/ui/Button'

/** Temporary Phase 1 home: proves the shell, tokens and fonts. Replaced in Phase 3. */
export default function HomePage() {
  return (
    <PageHero id="home-title" title="Ultimate Rovers" intro="The club website is being built.">
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/fixtures" variant="primary-dark" size="lg">
          See fixtures
        </ButtonLink>
        <ButtonLink href="/squad" variant="outline-dark" size="lg">
          Meet the squad
        </ButtonLink>
      </div>
    </PageHero>
  )
}
