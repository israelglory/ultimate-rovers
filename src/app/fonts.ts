import { Archivo, Big_Shoulders } from 'next/font/google'

/**
 * Google merged Big Shoulders Display into the variable Big Shoulders family.
 * The opsz axis is kept so the `display` utility can select the Display cut (opsz 72).
 * next/font downloads both files at build time and serves them from this site.
 */
export const displayFont = Big_Shoulders({
  subsets: ['latin'],
  axes: ['opsz'],
  display: 'swap',
  variable: '--font-big-shoulders',
  fallback: ['Arial Narrow', 'sans-serif'],
})

export const bodyFont = Archivo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-archivo',
  fallback: ['system-ui', 'sans-serif'],
})
