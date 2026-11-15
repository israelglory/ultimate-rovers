'use server'

import { headers } from 'next/headers'

import { type ContactField, handleContact, handleNewsletter } from '@/lib/forms/handlers'
import type { FormState } from '@/lib/forms/state'

/** Client address from the reverse proxy (Coolify's Traefik sets x-forwarded-for). */
async function clientIp(): Promise<string> {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
}

export async function subscribeToNewsletter(
  _prev: FormState<'email'>,
  data: FormData,
): Promise<FormState<'email'>> {
  return handleNewsletter(data, await clientIp())
}

export async function sendContactMessage(
  _prev: FormState<ContactField>,
  data: FormData,
): Promise<FormState<ContactField>> {
  return handleContact(data, await clientIp())
}
