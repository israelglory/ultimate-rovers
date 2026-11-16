import type { ComponentType } from 'react'

import { cn } from '@/lib/cn'

import { FacebookIcon, InstagramIcon, TikTokIcon, XIcon, YouTubeIcon } from './icons'

export type SocialPlatform = 'instagram' | 'x' | 'youtube' | 'tiktok' | 'facebook'
export type SocialLink = { platform: SocialPlatform; url: string }

const meta: Record<SocialPlatform, { label: string; Icon: ComponentType<{ size?: number }> }> = {
  instagram: { label: 'Instagram', Icon: InstagramIcon },
  x: { label: 'X', Icon: XIcon },
  youtube: { label: 'YouTube', Icon: YouTubeIcon },
  tiktok: { label: 'TikTok', Icon: TikTokIcon },
  facebook: { label: 'Facebook', Icon: FacebookIcon },
}

/** Round icon links on dark surfaces. `labelPrefix` gives "Player on Instagram" on profiles. */
export function SocialLinks({
  links,
  labelPrefix,
  className,
}: {
  links: SocialLink[]
  labelPrefix?: string
  className?: string
}) {
  if (links.length === 0) return null
  return (
    <ul className={cn('m-0 flex list-none flex-wrap gap-2 p-0', className)}>
      {links.map(({ platform, url }) => {
        const { label, Icon } = meta[platform]
        return (
          <li key={platform}>
            <a
              href={url}
              rel="noopener noreferrer"
              aria-label={labelPrefix ? `${labelPrefix} on ${label}` : label}
              className="flex size-touch items-center justify-center rounded-full bg-navy-raised text-white hover:bg-navy hover:text-cyan"
            >
              <Icon />
            </a>
          </li>
        )
      })}
    </ul>
  )
}
