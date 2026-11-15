import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import tokens from '../../ultimate-rovers-handoff/tokens/tokens.json'

const theme = readFileSync(path.resolve(import.meta.dirname, '../../src/styles/theme.css'), 'utf8')

function themeValue(name: string): string | undefined {
  const match = theme.match(new RegExp(`--${name}:\\s*([^;]+);`))
  return match?.[1]?.trim()
}

describe('Tailwind theme mirrors the design tokens', () => {
  it.each(Object.entries(tokens.color))('colour %s', (name, token) => {
    expect(themeValue(`color-${name}`)?.toLowerCase()).toBe(token.value.toLowerCase())
  })

  it.each(Object.entries(tokens.radius))('radius %s', (name, value) => {
    expect(themeValue(`radius-${name}`)).toBe(value)
  })

  it.each(['hero', 'page-title', 'section', 'card-title'] as const)('type size %s', (name) => {
    expect(themeValue(`text-${name}`)).toBe(tokens.typeScale[name].size)
    expect(Number(themeValue(`text-${name}--line-height`))).toBe(tokens.typeScale[name].lineHeight)
  })

  it('layout', () => {
    expect(themeValue('container-content')).toBe(tokens.layout.contentMax)
    expect(themeValue('spacing-gutter')).toBe(tokens.layout.gutter)
    expect(themeValue('spacing-touch')).toBe(tokens.layout.touchTarget)
  })
})
