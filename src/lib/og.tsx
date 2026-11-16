import 'server-only'

import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { ImageResponse } from 'next/og'
import type { ReactNode } from 'react'

import { brand } from '@/lib/brand'

export const ogSize = { width: 1200, height: 630 }

// Literal, statically scoped paths: a computed path would make the bundler trace the whole project.
const displayFontFile = () =>
  readFile(path.join(process.cwd(), 'src/assets/fonts', 'BigShoulders-Display-Black.ttf'))
const bodyFontFile = () =>
  readFile(path.join(process.cwd(), 'src/assets/fonts', 'Archivo-SemiBold.ttf'))
const crestFile = () => readFile(path.join(process.cwd(), 'public', 'crest.png'))

let fontsPromise: Promise<
  Array<{ name: string; data: Buffer; weight: 600 | 900; style: 'normal' }>
> | null = null
function fonts() {
  fontsPromise ??= Promise.all([displayFontFile(), bodyFontFile()]).then(([display, body]) => [
    { name: 'Display', data: display, weight: 900 as const, style: 'normal' as const },
    { name: 'Body', data: body, weight: 600 as const, style: 'normal' as const },
  ])
  return fontsPromise
}

let crestPromise: Promise<string> | null = null
export function clubCrestDataUrl(): Promise<string> {
  crestPromise ??= crestFile().then((b) => `data:image/png;base64,${b.toString('base64')}`)
  return crestPromise
}

/** Loads an uploaded image through this server; null if it cannot be fetched quickly. */
export async function uploadDataUrl(urlPath: string | null | undefined): Promise<string | null> {
  if (!urlPath) return null
  try {
    const res = await fetch(`http://127.0.0.1:${process.env.PORT ?? 3000}${urlPath}`, {
      signal: AbortSignal.timeout(2000),
    })
    if (!res.ok) return null
    const type = res.headers.get('content-type') ?? 'image/png'
    return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`
  } catch {
    return null
  }
}

/** Night card with the centre-circle motif, shared by every OG image. */
export async function renderOg(children: ReactNode): Promise<ImageResponse> {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        background: brand.night,
        color: brand.white,
        fontFamily: 'Body',
        borderBottom: `12px solid ${brand.cyan}`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 340,
          top: 55,
          width: 520,
          height: 520,
          borderRadius: 9999,
          border: `3px solid ${brand.cyan}`,
          opacity: 0.3,
          display: 'flex',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 599,
          top: 0,
          width: 3,
          height: 630,
          background: brand.cyan,
          opacity: 0.3,
          display: 'flex',
        }}
      />
      {children}
    </div>,
    { ...ogSize, fonts: await fonts() },
  )
}

export function OgCrest({ src, size }: { src: string | null; size: number }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" width={size} height={size} style={{ objectFit: 'contain' }} />
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 9999,
        border: `4px dashed ${brand.borderDark}`,
        display: 'flex',
      }}
    />
  )
}
