import 'server-only'

import { createHash } from 'node:crypto'

import { departmentFor, getClub } from '@/lib/data/club'
import { getPayloadClient } from '@/lib/payload'
import { createRateLimiter } from '@/lib/rate-limit'

import { contactSchema, fieldErrors, isHoneypotTripped, newsletterSchema } from './schemas'
import type { FormState } from './state'

export type ContactField = 'name' | 'email' | 'phone' | 'topic' | 'message'

const contactLimiter = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 })
const newsletterLimiter = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 })

export const NEWSLETTER_CONSENT_TEXT = 'Team news, fixtures and match reports in your inbox.'

/** One-way hash so abuse can be traced without storing raw IP addresses. */
export const hashIp = (ip: string) =>
  createHash('sha256')
    .update(`${ip}:${process.env.PAYLOAD_SECRET ?? ''}`)
    .digest('hex')
    .slice(0, 32)

const tooMany = (seconds: number) =>
  `Too many attempts from your connection. Please try again in ${Math.max(1, Math.ceil(seconds / 60))} minutes.`

const str = (data: FormData, key: string) => {
  const v = data.get(key)
  return typeof v === 'string' ? v : ''
}

export async function handleNewsletter(data: FormData, ip: string): Promise<FormState<'email'>> {
  const values = { email: str(data, 'email') }
  // Bots get a normal-looking success and nothing is stored.
  if (isHoneypotTripped(data))
    return { status: 'success', message: 'Look out for the next edition.' }

  const limit = newsletterLimiter.check(`newsletter:${ip}`)
  if (!limit.allowed) return { status: 'error', message: tooMany(limit.retryAfterSeconds), values }

  const parsed = newsletterSchema.safeParse(values)
  if (!parsed.success)
    return { status: 'error', fieldErrors: fieldErrors<'email'>(parsed.error), values }

  const email = parsed.data.email.toLowerCase()
  try {
    const payload = await getPayloadClient()
    const existing = await payload.find({
      collection: 'newsletter-subscribers',
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    // Same answer whether or not the address was already subscribed, so the form leaks nothing.
    if (existing.totalDocs === 0) {
      await payload.create({
        collection: 'newsletter-subscribers',
        data: { email, consent: true, consentText: NEWSLETTER_CONSENT_TEXT, source: 'footer' },
        overrideAccess: true,
      })
    }
    return { status: 'success', message: 'Look out for the next edition.' }
  } catch (error) {
    console.error('[newsletter] could not store subscriber', error)
    return {
      status: 'error',
      message: 'Something went wrong on our side. Please try again in a moment.',
      values,
    }
  }
}

export async function handleContact(data: FormData, ip: string): Promise<FormState<ContactField>> {
  const values = {
    name: str(data, 'name'),
    email: str(data, 'email'),
    phone: str(data, 'phone'),
    topic: str(data, 'topic'),
    message: str(data, 'message'),
  }
  if (isHoneypotTripped(data)) return { status: 'success' }

  const limit = contactLimiter.check(`contact:${ip}`)
  if (!limit.allowed) return { status: 'error', message: tooMany(limit.retryAfterSeconds), values }

  const parsed = contactSchema.safeParse(values)
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Check the highlighted fields and try again.',
      fieldErrors: fieldErrors<ContactField>(parsed.error),
      values,
    }
  }

  const input = parsed.data
  try {
    const payload = await getPayloadClient()
    const club = await getClub()
    const department = departmentFor(club, input.topic)
    const submission = await payload.create({
      collection: 'contact-submissions',
      data: {
        ...input,
        phone: input.phone || undefined,
        routedTo: department?.email,
        ipHash: hashIp(ip),
      },
      overrideAccess: true,
    })

    let emailStatus: 'sent' | 'failed' = 'failed'
    if (department) {
      try {
        await payload.sendEmail({
          to: department.email,
          replyTo: input.email,
          subject: `Website message: ${department.title} from ${input.name}`,
          text: [
            `Name: ${input.name}`,
            `Email: ${input.email}`,
            input.phone ? `Phone: ${input.phone}` : null,
            `Topic: ${department.title}`,
            '',
            input.message,
          ]
            .filter((line) => line !== null)
            .join('\n'),
        })
        emailStatus = 'sent'
      } catch (error) {
        console.error('[contact] email failed, message is stored in the CMS', error)
      }
    }
    await payload.update({
      collection: 'contact-submissions',
      id: submission.id,
      data: { emailStatus },
      overrideAccess: true,
    })
    return { status: 'success' }
  } catch (error) {
    console.error('[contact] could not store message', error)
    return {
      status: 'error',
      message: 'Something went wrong on our side. Please try again, or email us directly.',
      values,
    }
  }
}
