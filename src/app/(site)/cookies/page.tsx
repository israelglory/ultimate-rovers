import type { Metadata } from 'next'

import { LegalPage } from '@/components/layout/LegalPage'
import { getClub } from '@/lib/data/club'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: 'Cookie policy',
    description: 'The cookies this site uses and how to control them.',
    path: '/cookies',
  })
}

export default async function Page() {
  const club = await getClub()
  return (
    <LegalPage
      id="cookies-title"
      title="Cookie policy"
      intro="The cookies this site uses and how to control them."
      body={club.legal.cookies}
    />
  )
}
