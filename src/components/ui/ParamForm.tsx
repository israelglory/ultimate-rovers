'use client'

import { usePathname, useRouter } from 'next/navigation'
import { type ComponentProps, type FormEvent, useTransition } from 'react'

/**
 * A GET form for filters. Without JavaScript it submits normally. With JavaScript it builds a clean
 * URL (empty and default values dropped), navigates without a full reload and keeps scroll position.
 *
 * Submit buttons (filter chips) contribute their own name and value. Put hidden inputs that carry the
 * current filter after the chips: the first value for a key wins, both here and in the server parser,
 * so a pressed chip overrides the hidden value and other submissions keep it.
 */
export function ParamForm({
  defaults = {},
  children,
  ...rest
}: { defaults?: Record<string, string> } & Omit<
  ComponentProps<'form'>,
  'action' | 'method' | 'onSubmit'
>) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    const data = new FormData(event.currentTarget, submitter)
    const params = new URLSearchParams()
    const seen = new Set<string>()
    for (const [key, value] of data.entries()) {
      if (seen.has(key)) continue
      seen.add(key)
      if (typeof value !== 'string' || value === '' || defaults[key] === value) continue
      params.set(key, value)
    }
    const query = params.toString()
    startTransition(() => router.push(query ? `${pathname}?${query}` : pathname, { scroll: false }))
  }

  return (
    <form method="get" onSubmit={onSubmit} aria-busy={pending || undefined} {...rest}>
      {children}
    </form>
  )
}

/** A select that submits its form when changed. A visible button is offered when JavaScript is off. */
export function AutoSubmitSelect(props: ComponentProps<'select'>) {
  return <select {...props} onChange={(e) => e.currentTarget.form?.requestSubmit()} />
}
