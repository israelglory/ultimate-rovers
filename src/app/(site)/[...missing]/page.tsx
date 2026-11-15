import { notFound } from 'next/navigation'

/**
 * The site and the Payload admin have separate root layouts, so there is no app-wide 404.
 * Unknown URLs land here and render (site)/not-found.tsx inside the site chrome.
 */
export default function CatchAll() {
  notFound()
}
