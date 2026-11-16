import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Invalidate cached data and pages after a CMS change.
 * `expire: 0` makes the next request fetch fresh data instead of serving stale content,
 * which matters on matchday. Outside a Next request (seed script, migrations) the Next
 * APIs throw; that is expected and ignored because there is nothing cached to clear.
 */
export function revalidate({ tags = [], paths = [] }: { tags?: string[]; paths?: string[] }): void {
  for (const tag of new Set(tags)) {
    try {
      revalidateTag(tag, { expire: 0 })
    } catch {
      // Not running inside Next.js.
    }
  }
  for (const path of new Set(paths)) {
    try {
      revalidatePath(path)
    } catch {
      // Not running inside Next.js.
    }
  }
}
