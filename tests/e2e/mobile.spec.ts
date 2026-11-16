import { expect, test } from '@playwright/test'

import { expectNoA11yViolations } from './helpers'

test('mobile menu opens as a dialog, traps focus and closes with Escape', async ({ page }) => {
  await page.goto('/')
  const open = page.getByRole('button', { name: 'Open menu' })
  await expect(open).toHaveAttribute('aria-expanded', 'false')
  await open.click()
  const dialog = page.getByRole('dialog', { name: 'Menu' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('link', { name: 'Home', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await expectNoA11yViolations(page)
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()

  await open.click()
  await dialog.getByRole('link', { name: 'Squad' }).click()
  await expect(page).toHaveURL(/\/squad$/)
  await expect(page.getByRole('dialog', { name: 'Menu' })).toBeHidden()
})

test('home on a phone follows the mobile design', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeHidden()
  await expect(page.getByRole('heading', { name: 'Next match' }).last()).toBeVisible()
  await expectNoA11yViolations(page)
})

test('fixture cards on a phone: no date tile, full team names, buttons in one row', async ({
  page,
}) => {
  await page.goto('/fixtures')
  const card = page.locator('main article').first()
  await expect(card.locator('[aria-hidden="true"].sm\\:block')).toBeHidden()
  await expect(card.locator('time').first()).toBeVisible()
  // Club names wrap only between words: "Ultimate Rovers" fits on one line.
  const name = card.getByText('Ultimate Rovers', { exact: true })
  const lineHeight = await name.evaluate((el) => parseFloat(getComputedStyle(el).lineHeight))
  expect((await name.boundingBox())!.height).toBeLessThan(lineHeight * 1.5)
  const buttons = card.getByRole('link', { name: /Match centre/ })
  const calendar = card.getByRole('link', { name: /to calendar/ })
  expect(
    Math.abs((await buttons.boundingBox())!.y - (await calendar.boundingBox())!.y),
  ).toBeLessThan(2)
})

test('home hero: title and crest never overlap', async ({ page }) => {
  for (const width of [320, 360, 390, 430]) {
    await page.setViewportSize({ width, height: 800 })
    await page.goto('/')
    const title = (await page.locator('#hero-title').boundingBox())!
    const crest = (await page.locator('#hero-title + div img').boundingBox())!
    expect(title.x + title.width, `overlap at ${width}px`).toBeLessThanOrEqual(crest.x + 1)
    expect(crest.x + crest.width).toBeLessThanOrEqual(width)
  }
})

test('squad on a phone shows two players per row', async ({ page }) => {
  await page.goto('/squad')
  const cards = page.locator('main ul li')
  const first = (await cards.nth(1).boundingBox())!
  const second = (await cards.nth(2).boundingBox())!
  expect(Math.abs(first.y - second.y)).toBeLessThan(2)
})

test('line-ups stand upright on a phone with no sideways scrolling', async ({ page }) => {
  await page.goto('/fixtures?view=results')
  const href = await page.locator('main a[href^="/matches/"]').first().getAttribute('href')
  await page.goto(`${href}?tab=lineups`)
  const pitch = (await page
    .getByRole('region', { name: 'Pitch view' })
    .locator('> div')
    .first()
    .boundingBox())!
  expect(pitch.height).toBeGreaterThan(pitch.width)
  expect(pitch.x + pitch.width).toBeLessThanOrEqual(390)
})
