/** Builds Lexical JSON for seeded rich text. */

const text = (value: string) => ({
  type: 'text',
  text: value,
  format: 0,
  detail: 0,
  mode: 'normal',
  style: '',
  version: 1,
})

const paragraph = (value: string) => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  textFormat: 0,
  textStyle: '',
  children: [text(value)],
})

const heading = (value: string, tag: 'h2' | 'h3') => ({
  type: 'heading',
  tag,
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children: [text(value)],
})

const quote = (value: string) => ({
  type: 'quote',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children: [text(value)],
})

export type Block = string | { h2: string } | { h3: string } | { quote: string }

/** Plain strings become paragraphs; `{ h2 }`, `{ h3 }` and `{ quote }` become those nodes. */
export function richText(blocks: Block[]) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: blocks.map((b) => {
        if (typeof b === 'string') return paragraph(b)
        if ('h2' in b) return heading(b.h2, 'h2')
        if ('h3' in b) return heading(b.h3, 'h3')
        return quote(b.quote)
      }),
    },
  }
}
