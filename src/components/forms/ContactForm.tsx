'use client'

import { type ComponentProps, useActionState, useEffect, useId, useRef, useState } from 'react'

import { sendContactMessage } from '@/app/actions'
import { CheckCircleIcon } from '@/components/ui/icons'
import { cn } from '@/lib/cn'
import type { ContactField } from '@/lib/forms/handlers'
import type { FormState } from '@/lib/forms/state'
import type { ContactTopic } from '@/lib/search-params'

const topics: Array<{ value: ContactTopic; label: string }> = [
  { value: 'general', label: 'General enquiry' },
  { value: 'membership', label: 'Membership' },
  { value: 'partnerships', label: 'Partnerships and sponsorship' },
  { value: 'media', label: 'Media and press' },
  { value: 'academy', label: 'Trials and academy' },
]

const control =
  'min-h-12 w-full rounded-button border border-line-strong bg-white px-3.5 text-[15px] text-ink aria-invalid:border-2 aria-invalid:border-card-red'

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: (props: {
    id: string
    'aria-invalid'?: true
    'aria-describedby'?: string
  }) => React.ReactNode
}) {
  const errorId = `${id}-error`
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[14px] font-semibold">
        {label}
      </label>
      {children({
        id,
        ...(error ? { 'aria-invalid': true as const, 'aria-describedby': errorId } : {}),
      })}
      {error ? (
        <p id={errorId} className="m-0 text-[14px] font-semibold text-card-red">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function Form({
  topic,
  replyDays,
  onSent,
}: {
  topic: ContactTopic
  replyDays: number
  onSent: () => void
}) {
  const [state, action, pending] = useActionState<FormState<ContactField>, FormData>(
    sendContactMessage,
    { status: 'idle' },
  )
  const id = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const errors = state.fieldErrors ?? {}
  const v = state.values ?? {}

  useEffect(() => {
    if (state.status === 'success') onSent()
    if (state.status === 'error') {
      // Move focus to the first invalid field so keyboard and screen reader users land on the problem.
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    }
  }, [state, onSent])

  const input = (props: ComponentProps<'input'>) => <input {...props} className={control} />

  return (
    <form ref={formRef} action={action} noValidate aria-describedby={`${id}-privacy`}>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-[18px]">
        <Field id={`${id}-name`} label="Full name" error={errors.name}>
          {(p) =>
            input({
              ...p,
              name: 'name',
              type: 'text',
              autoComplete: 'name',
              required: true,
              defaultValue: v.name,
            })
          }
        </Field>
        <Field id={`${id}-email`} label="Email" error={errors.email}>
          {(p) =>
            input({
              ...p,
              name: 'email',
              type: 'email',
              autoComplete: 'email',
              required: true,
              defaultValue: v.email,
            })
          }
        </Field>
        <Field id={`${id}-phone`} label="Phone (optional)" error={errors.phone}>
          {(p) =>
            input({ ...p, name: 'phone', type: 'tel', autoComplete: 'tel', defaultValue: v.phone })
          }
        </Field>
        <Field id={`${id}-topic`} label="Topic" error={errors.topic}>
          {(p) => (
            <select {...p} name="topic" defaultValue={v.topic || topic} className={control}>
              {topics.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>
      <div className="mt-[18px]">
        <Field id={`${id}-message`} label="Message" error={errors.message}>
          {(p) => (
            <textarea
              {...p}
              name="message"
              rows={6}
              required
              defaultValue={v.message}
              className={cn(control, 'min-h-36 resize-y py-3')}
            />
          )}
        </Field>
      </div>
      {/* Honeypot: hidden from people, often filled in by bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <p role="alert" className="m-0 mt-4 text-[15px] font-semibold text-card-red empty:hidden">
        {state.status === 'error' ? state.message : ''}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <p id={`${id}-privacy`} className="m-0 max-w-[420px] text-[14px] text-slate">
          We reply within {replyDays} working {replyDays === 1 ? 'day' : 'days'}. We only use your
          details to answer this message.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="min-h-[52px] rounded-button bg-navy px-7 text-[16px] font-bold text-white hover:bg-night disabled:opacity-70"
        >
          {pending ? 'Sending' : 'Send message'}
        </button>
      </div>
    </form>
  )
}

/** Contact form: idle, field errors, submitting and sent, as drawn on Contact. */
export function ContactForm({ topic, replyDays }: { topic: ContactTopic; replyDays: number }) {
  const [sent, setSent] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const headingRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (sent) headingRef.current?.focus()
  }, [sent])

  if (sent) {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-2.5 rounded-card bg-cyan-tint p-7"
      >
        <CheckCircleIcon className="text-navy" />
        <p ref={headingRef} tabIndex={-1} className="m-0 text-[20px] font-bold outline-none">
          Message sent
        </p>
        <p className="m-0 text-[15px] text-ink-soft">
          Thanks for getting in touch. We reply within {replyDays} working{' '}
          {replyDays === 1 ? 'day' : 'days'}.
        </p>
        <button
          type="button"
          onClick={() => {
            setFormKey((k) => k + 1)
            setSent(false)
          }}
          className="mt-1.5 min-h-touch rounded-button border border-navy bg-transparent px-[18px] text-[14px] font-bold text-navy hover:bg-navy hover:text-white"
        >
          Send another message
        </button>
      </div>
    )
  }
  return <Form key={formKey} topic={topic} replyDays={replyDays} onSent={() => setSent(true)} />
}
