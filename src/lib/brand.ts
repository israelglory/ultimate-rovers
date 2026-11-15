import tokens from '../../ultimate-rovers-handoff/tokens/tokens.json'

/** Token colours for places CSS cannot reach: OG images, theme-color meta, emails. */
export const brand = {
  night: tokens.color.night.value,
  navy: tokens.color.navy.value,
  navySoft: tokens.color['navy-soft'].value,
  navySilhouette: tokens.color['navy-silhouette'].value,
  cyan: tokens.color.cyan.value,
  white: tokens.color.white.value,
  mistText: tokens.color['mist-text'].value,
  borderDark: tokens.color['border-dark'].value,
} as const
