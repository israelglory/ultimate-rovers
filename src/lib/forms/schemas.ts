import { z } from 'zod'

import { contactTopicValues } from '@/lib/search-params'

const email = z
  .string()
  .trim()
  .min(1, 'Enter your email address.')
  .max(254, 'Email address is too long.')
  .pipe(z.email('Enter an email address like name@example.com.'))

export const newsletterSchema = z.object({ email })

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Enter your full name.').max(120, 'Name is too long.'),
  email,
  phone: z
    .string()
    .trim()
    .max(40, 'Phone number is too long.')
    .refine(
      (v) => v === '' || /^[+()\d\s-]{6,}$/.test(v),
      'Enter a phone number using digits, spaces and +.',
    )
    .optional()
    .default(''),
  topic: z.enum(contactTopicValues, { error: 'Choose a topic.' }),
  message: z
    .string()
    .trim()
    .min(10, 'Write a message of at least 10 characters.')
    .max(5000, 'Keep the message under 5,000 characters.'),
})

export type ContactInput = z.infer<typeof contactSchema>

/** Turns zod issues into one message per field, the first issue winning. */
export function fieldErrors<Field extends string>(
  error: z.ZodError,
): Partial<Record<Field, string>> {
  const out: Partial<Record<Field, string>> = {}
  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key === 'string' && !(key in out)) out[key as Field] = issue.message
  }
  return out
}

/** Bots fill hidden fields; people never see them. */
export const isHoneypotTripped = (data: FormData) => {
  const value = data.get('website')
  return typeof value === 'string' && value.trim() !== ''
}
