import Image from 'next/image'

import { cn } from '@/lib/cn'
import type { PartnerData } from '@/lib/data/content'

/** A partner's logo linked to their site, or the dashed name box drawn in the designs. */
export function PartnerLogo({
  partner,
  className,
  tone = 'light',
}: {
  partner: PartnerData
  className?: string
  tone?: 'light' | 'dark'
}) {
  const box = cn(
    'flex items-center justify-center rounded-[10px] px-3 text-center text-[14px]',
    partner.logo
      ? ''
      : tone === 'dark'
        ? 'border border-dashed border-border-dark'
        : 'border border-dashed border-line-strong',
    tone === 'dark' ? 'text-mist-text' : 'text-slate',
    className,
  )
  const content = partner.logo ? (
    <Image
      src={partner.logo.url}
      alt={partner.name}
      width={partner.logo.width}
      height={partner.logo.height}
      sizes="240px"
      className="max-h-[70%] w-auto max-w-[80%] object-contain"
    />
  ) : (
    <span>{partner.name}</span>
  )
  if (!partner.url) return <div className={box}>{content}</div>
  return (
    <a
      href={partner.url}
      rel="noopener sponsored"
      className={cn(box, 'no-underline hover:border-navy')}
    >
      {content}
    </a>
  )
}
