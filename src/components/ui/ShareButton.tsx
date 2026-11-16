'use client'

import { useState } from 'react'

import { buttonClass, type ButtonStyleOptions } from './Button'

/** Native share sheet where available, otherwise copies the page link. */
export function ShareButton({
  label = 'Share',
  title,
  style,
}: {
  label?: string
  title: string
  style: ButtonStyleOptions
}) {
  const [status, setStatus] = useState('')

  async function share() {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setStatus('Link copied')
    } catch {
      // Dismissed share sheet or blocked clipboard: nothing to report.
    }
    setTimeout(() => setStatus(''), 3000)
  }

  return (
    <>
      <button type="button" onClick={share} className={buttonClass(style)}>
        {status || label}
      </button>
      <span className="sr-only" aria-live="polite">
        {status}
      </span>
    </>
  )
}
