'use server'

import type { FormState } from '@/lib/forms/state'

/** Footer newsletter signup. Wired to storage in Phase 2. */
export async function subscribeToNewsletter(
  _prev: FormState<'email'>,
  _data: FormData,
): Promise<FormState<'email'>> {
  return { status: 'error', message: 'Newsletter signup opens soon.' }
}
