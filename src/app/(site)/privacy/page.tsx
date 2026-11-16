import type { Metadata } from 'next'

import { LegalPage } from '@/components/layout/LegalPage'
import { getClub } from '@/lib/data/club'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: 'Privacy policy',
    description: 'How Ultimate Rovers collects, uses and protects your personal information.',
    path: '/privacy',
  })
}

export default async function Page() {
  const club = await getClub()
  return (
    <LegalPage
      id="privacy-title"
      title="Privacy policy"
      intro="How Ultimate Rovers collects, uses and protects your personal information."
      body={club.legal.privacy}
    />
  )
}
