import { expect, test } from '@playwright/test'

import { expectNoA11yViolations, expectNoHorizontalScroll } from './helpers'

const staticPages = [
  '/',
  '/fixtures',
  '/fixtures?view=results',
  '/fixtures?view=table',
  '/squad',
  '/news',
  '/club',
  '/club/stakeholders',
  '/contact',
  '/privacy',
  '/missing-page',
]

for (const path of staticPages) {
  test(`axe: ${path}`, async ({ page }) => {
    await page.goto(path)
    await expectNoA11yViolations(page)
  })
}

test('axe: match centre in every tab, a player profile and an article', async ({ page }) => {
  await page.goto('/fixtures?view=results')
  const match = await page.locator('main a[href^="/matches/"]').first().getAttribute('href')
  for (const tab of ['', '?tab=lineups', '?tab=stats', '?tab=report', '?tab=h2h']) {
    await page.goto(`${match}${tab}`)
    await expectNoA11yViolations(page)
  }
  await page.goto('/squad')
  await page.goto(
    (await page.locator('main a[href^="/squad/"]').first().getAttribute('href')) ?? '/squad',
  )
  await expectNoA11yViolations(page)
  await page.goto('/news')
  await page.goto(
    (await page.locator('main a[href^="/news/"]').first().getAttribute('href')) ?? '/news',
  )
  await expectNoA11yViolations(page)
})

test('no horizontal scroll at 360px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  for (const path of [
    '/',
    '/fixtures',
    '/fixtures?view=table',
    '/squad',
    '/news',
    '/club',
    '/club/stakeholders',
    '/contact',
  ]) {
    await page.goto(path)
    await expectNoHorizontalScroll(page)
  }
})

test('the header stays on one line at every desktop width', async ({ page }) => {
  for (const width of [900, 960, 1024, 1180, 1280, 1440]) {
    await page.setViewportSize({ width, height: 800 })
    await page.goto('/')
    const height = (await page.locator('header').boundingBox())!.height
    expect(height, `header wraps at ${width}px`).toBeLessThan(90)
  }
})
