import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

import { revalidate } from '@/lib/revalidate'

type Targets = { tags: string[]; paths: string[] }
type DocLike = Record<string, unknown>

/**
 * Builds afterChange and afterDelete hooks that revalidate the given tags and paths.
 * `resolve` sees the saved document and, on update, the previous one so renamed slugs
 * also clear their old URL. Seed and migration scripts pass `context.disableRevalidate`.
 */
export function revalidateCollection(resolve: (doc: DocLike, previous?: DocLike) => Targets): {
  afterChange: CollectionAfterChangeHook
  afterDelete: CollectionAfterDeleteHook
} {
  return {
    afterChange: ({ doc, previousDoc, context }) => {
      if (!context.disableRevalidate)
        revalidate(resolve(doc as DocLike, previousDoc as DocLike | undefined))
      return doc
    },
    afterDelete: ({ doc, context }) => {
      if (!context.disableRevalidate) revalidate(resolve(doc as DocLike))
      return doc
    },
  }
}

export function revalidateGlobal(targets: Targets): GlobalAfterChangeHook {
  return ({ doc, context }) => {
    if (!context.disableRevalidate) revalidate(targets)
    return doc
  }
}

export const slugOf = (doc?: DocLike): string | undefined =>
  doc && typeof doc.slug === 'string' && doc.slug !== '' ? doc.slug : undefined
