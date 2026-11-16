import type { Field, TextField } from 'payload'

import { slugify } from '@/lib/slug'

/**
 * Slug in the sidebar. Generated from `source` when left empty, and kept stable afterwards
 * so shared links keep working. Clear it to regenerate.
 */
export function slugField(
  source: (data: Record<string, unknown>) => string | undefined,
): TextField {
  return {
    name: 'slug',
    type: 'text',
    unique: true,
    index: true,
    admin: {
      position: 'sidebar',
      description: 'Part of the page address. Filled in automatically; clear it to regenerate.',
    },
    hooks: {
      beforeValidate: [
        ({ value, data, originalDoc }) => {
          if (typeof value === 'string' && value.trim() !== '') return slugify(value)
          const merged = { ...(originalDoc ?? {}), ...(data ?? {}) } as Record<string, unknown>
          const generated = source(merged)
          return generated ? slugify(generated) : value
        },
      ],
    },
  }
}

export const orderField: Field = {
  name: 'order',
  type: 'number',
  defaultValue: 0,
  admin: { position: 'sidebar', description: 'Lower numbers appear first.' },
}

export const yearPattern = /^\d{4}$/
export const seasonPattern = /^\d{4}\/\d{2}$/

export const validateSeason = (value: unknown): true | string =>
  typeof value === 'string' && seasonPattern.test(value) ? true : 'Use the format 2026/27.'

export const urlValidate = (value: unknown): true | string => {
  if (value == null || value === '') return true
  try {
    const url = new URL(String(value))
    return url.protocol === 'https:' || url.protocol === 'http:' ? true : 'Use a full web address.'
  } catch {
    return 'Use a full web address, starting with https://'
  }
}
