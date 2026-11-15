'use client'

import { useActionState, useId } from 'react'

import type { FormState } from '@/lib/forms/state'

type Action = (state: FormState<'email'>, data: FormData) => Promise<FormState<'email'>>

/** Footer newsletter signup: idle, submitting, error and success states. */
export function NewsletterForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState(action, {
    status: 'idle',
  } as FormState<'email'>)
  const id = useId()
  const emailId = `${id}-email`
  const errorId = `${id}-error`
  const emailError = state.fieldErrors?.email

  if (state.status === 'success') {
    return (
      <div role="status" className="rounded-card bg-navy p-4">
        <p className="m-0 text-[15px] font-bold text-white">You&apos;re subscribed</p>
        <p className="m-0 mt-1 text-[14px] text-mist-text">{state.message}</p>
      </div>
    )
  }

  return (
    <form action={formAction} noValidate className="flex flex-wrap gap-2">
      <label htmlFor={emailId} className="sr-only">
        Email address
      </label>
      <input
        id={emailId}
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@example.com"
        defaultValue={state.values?.email}
        aria-invalid={emailError ? true : undefined}
        aria-describedby={emailError ? errorId : undefined}
        className="min-h-12 min-w-0 flex-[1_1_200px] rounded-button border border-border-dark bg-navy px-3.5 text-[15px] text-white placeholder:text-mist-text aria-invalid:border-card-yellow"
      />
      {/* Honeypot: hidden from people, often filled in by bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="min-h-12 rounded-button bg-cyan px-5 text-[15px] font-bold text-night disabled:opacity-70"
      >
        {pending ? 'Subscribing' : 'Subscribe'}
      </button>
      <p
        id={errorId}
        aria-live="polite"
        className="m-0 w-full text-[14px] text-card-yellow empty:hidden"
      >
        {emailError ?? (state.status === 'error' ? state.message : '')}
      </p>
    </form>
  )
}
