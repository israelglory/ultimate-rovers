import type { Metadata } from 'next'

import { LegalPage } from '@/components/layout/LegalPage'
import { getClub } from '@/lib/data/club'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: 'Terms of use',
    description: 'The terms that apply when you use the Ultimate Rovers website.',
    path: '/terms',
  })
}

export default async function Page() {
  const club = await getClub()
  return (
    <LegalPage
      id="terms-title"
      title="Terms of use"
      intro="The terms that apply when you use the Ultimate Rovers website."
      body={club.legal.terms}
    />
  )
}
