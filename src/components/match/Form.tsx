import { cn } from '@/lib/cn'
import type { FormResult } from '@/lib/types'

const word: Record<FormResult, string> = { W: 'Win', D: 'Draw', L: 'Loss' }

/**
 * League table form: five dots, oldest on the left. Navy for a win, grey for a draw, outlined for a
 * loss, as drawn. Fill versus outline gives a second signal besides colour, and each result is
 * spelled out for screen readers.
 */
export function FormDots({ form }: { form: FormResult[] }) {
  const slots: Array<FormResult | null> = [
    ...Array(Math.max(0, 5 - form.length)).fill(null),
    ...form,
  ]
  return (
    <span className="inline-flex gap-1">
      <span className="sr-only">
        {form.length
          ? `Last ${form.length}, oldest first: ${form.map((f) => word[f]).join(', ')}`
          : 'No results yet'}
      </span>
      {slots.map((f, i) => (
        <span
          key={i}
          aria-hidden="true"
          title={f ? word[f] : undefined}
          className={cn(
            'box-border size-2.5 rounded-full',
            f === 'W' && 'bg-navy',
            f === 'D' && 'bg-line-strong',
            f === 'L' && 'border-2 border-navy bg-white',
            f === null && 'bg-line',
          )}
        />
      ))}
    </span>
  )
}

/** Match centre form guide: five lettered boxes, oldest on the left. */
export function FormBoxes({ form }: { form: FormResult[] }) {
  const slots: Array<FormResult | null> = [
    ...Array(Math.max(0, 5 - form.length)).fill(null),
    ...form.slice(-5),
  ]
  return (
    <span className="flex gap-1.5">
      {slots.map((f, i) => (
        <span
          key={i}
          className={cn(
            'box-border flex size-9 items-center justify-center rounded-button font-bold',
            f === 'W' && 'bg-navy text-white',
            f === 'D' && 'bg-line-strong text-ink',
            f === 'L' && 'border border-line-strong bg-white text-ink',
            f === null && 'bg-mist text-slate',
          )}
        >
          {f ? (
            <>
              <span aria-hidden="true">{f}</span>
              <span className="sr-only">{word[f]}</span>
            </>
          ) : (
            <>
              <span aria-hidden="true">-</span>
              <span className="sr-only">No result</span>
            </>
          )}
        </span>
      ))}
    </span>
  )
}
