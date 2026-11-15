import {
  type JSXConvertersFunction,
  RichText as LexicalRichText,
} from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'

import { cleanUrl } from '@/lib/data/mappers'
import { cn } from '@/lib/cn'
import type { RichTextValue } from '@/lib/types'

import { VideoEmbed } from './VideoEmbed'

type UploadValue = {
  url?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
  mimeType?: string | null
}
type VideoBlockFields = {
  url: string
  title: string
  caption?: string | null
  poster?: UploadValue | number | null
}

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: ({ node }) => {
    const value = (node as { value?: UploadValue }).value
    if (!value || typeof value !== 'object' || !value.url || !value.mimeType?.startsWith('image/'))
      return null
    return (
      <figure>
        <Image
          src={cleanUrl(value.url)}
          alt={value.alt === 'Decorative' ? '' : (value.alt ?? '')}
          width={value.width ?? 1200}
          height={value.height ?? 675}
          sizes="(max-width: 800px) 100vw, 760px"
          className="h-auto w-full"
        />
      </figure>
    )
  },
  blocks: {
    videoEmbed: ({ node }: { node: unknown }) => {
      const fields = (node as { fields: VideoBlockFields }).fields
      const poster =
        fields.poster && typeof fields.poster === 'object' && fields.poster.url
          ? fields.poster
          : null
      return (
        <figure>
          <VideoEmbed
            title={fields.title}
            url={fields.url}
            poster={
              poster
                ? {
                    url: cleanUrl(poster.url ?? ''),
                    alt: '',
                    width: poster.width ?? 1280,
                    height: poster.height ?? 720,
                  }
                : null
            }
          />
          {fields.caption ? (
            <figcaption className="mt-2 text-[14px] text-slate">{fields.caption}</figcaption>
          ) : null}
        </figure>
      )
    },
  },
})

/** CMS rich text with the report body styles (prose-report in globals.css). */
export function RichText({
  value,
  className,
}: {
  value: RichTextValue | null | undefined
  className?: string
}) {
  if (!value?.root?.children?.length) return null
  return (
    <LexicalRichText
      // The stored value is Lexical JSON; the renderer's own type is stricter than what Payload returns.
      data={value as unknown as Parameters<typeof LexicalRichText>[0]['data']}
      converters={converters}
      disableContainer
      className={cn('prose-report', className)}
    />
  )
}
