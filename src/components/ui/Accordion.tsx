'use client'

import { useId, useState } from 'react'

import { cn } from '@/lib/cn'

/**
 * One panel open at a time, as drawn on Contact. Buttons carry aria-expanded and aria-controls;
 * answers stay in the HTML (hidden when closed) so search engines and find-in-page still see them.
 */
export function Accordion({
  items,
  defaultOpen = 0,
}: {
  items: Array<{ question: string; answer: string }>
  defaultOpen?: number
}) {
  const [open, setOpen] = useState<number>(defaultOpen)
  const id = useId()
  return (
    <div className="border-t-2 border-night">
      {items.map((item, i) => {
        const expanded = open === i
        return (
          <div key={item.question} className="border-b border-line">
            <h3 className="m-0">
              <button
                type="button"
                id={`${id}-q${i}`}
                aria-expanded={expanded}
                aria-controls={`${id}-a${i}`}
                onClick={() => setOpen(expanded ? -1 : i)}
                className="flex min-h-16 w-full items-center justify-between gap-4 border-0 bg-transparent py-4 text-left text-[18px] font-bold text-ink"
              >
                <span>{item.question}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex size-8 flex-[0_0_32px] items-center justify-center rounded-full text-[22px] leading-none transition-transform duration-200',
                    expanded ? 'rotate-45 bg-night text-white' : 'bg-mist text-night',
                  )}
                >
                  +
                </span>
              </button>
            </h3>
            <div
              id={`${id}-a${i}`}
              role="region"
              aria-labelledby={`${id}-q${i}`}
              hidden={!expanded}
            >
              <p className="m-0 mb-5 max-w-[720px] text-[16px] leading-[1.6] text-ink-soft">
                {item.answer}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
