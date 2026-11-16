import { expect, test } from '@playwright/test'

test.describe('home to match centre', () => {
  test('opens a recent result and moves between tabs with mouse and keyboard', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Home' }),
    ).toHaveAttribute('aria-current', 'page')
    await expect(page.getByRole('heading', { name: 'Next match' }).first()).toBeVisible()
    await expect(page.getByRole('timer', { name: /Countdown to kick-off/ }).first()).toBeVisible()

    const results = page.locator('section[aria-labelledby="results-title"]')
    await results
      .getByRole('link', { name: /Match centre/ })
      .first()
      .click()
    await expect(page).toHaveURL(/\/matches\/[\w-]+$/)
    await expect(
      page
        .getByRole('navigation', { name: 'Main' })
        .getByRole('link', { name: 'Fixtures & results' }),
    ).toHaveAttribute('aria-current', 'page')

    const tabs = page.getByRole('tablist', { name: 'Match sections' })
    await expect(tabs.getByRole('tab', { name: 'Summary' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page.getByRole('heading', { name: 'Key moments' })).toBeVisible()

    await tabs.getByRole('tab', { name: 'Line-ups' }).click()
    await expect(page).toHaveURL(/\?tab=lineups/)
    await expect(tabs.getByRole('tab', { name: 'Line-ups' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(
      page
        .getByRole('list', { name: /starting line-up/ })
        .first()
        .getByRole('listitem')
        .first(),
    ).toBeVisible()

    await tabs.getByRole('tab', { name: 'Line-ups' }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(page).toHaveURL(/\?tab=stats/)
    await expect(page.getByRole('heading', { name: 'Match stats' })).toBeVisible()
    await expect(tabs.getByRole('tab', { name: 'Stats' })).toBeFocused()

    // A shared link opens the same tab.
    await page.goto(`${new URL(page.url()).pathname}?tab=h2h`)
    await expect(page.getByRole('heading', { name: 'Head to head' })).toBeVisible()
  })

  test('the next fixture shows the preview state with a calendar download', async ({
    page,
    request,
  }) => {
    await page.goto('/')
    await page
      .locator('section[aria-labelledby="next-match-title"]')
      .getByRole('link', { name: 'Match centre' })
      .first()
      .click()
    await expect(page.getByRole('tab', { name: 'Preview' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page.getByRole('heading', { name: 'Match preview' })).toBeVisible()
    const ics = await request.get(`${new URL(page.url()).pathname}/calendar.ics`)
    expect(ics.headers()['content-type']).toContain('text/calendar')
    expect(await ics.text()).toContain('BEGIN:VEVENT')
  })
})

test.describe('squad to player', () => {
  test('filters by position and opens a profile with the stats toggle', async ({ page }) => {
    await page.goto('/squad')
    const forwards = page.getByRole('button', { name: /^Forwards/ })
    await forwards.click()
    await expect(page).toHaveURL(/position=forwards/)
    await expect(page.getByRole('button', { name: /^Forwards/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(page.getByRole('heading', { level: 2, name: 'Forwards' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: 'Goalkeepers' })).toHaveCount(0)

    await page.locator('main a[href^="/squad/"]').first().click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/\w{2,}/)
    await expect(
      page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Forwards' }),
    ).toBeVisible()

    const period = page.getByRole('tablist', { name: 'Stats period' })
    await expect(period.getByRole('tab', { name: 'This season' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await period.getByRole('tab', { name: 'All competitions, career' }).click()
    await expect(page).toHaveURL(/stats=career/)
    await expect(page.getByText('Career figures across every club, league and cup.')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'More forwards' })).toBeVisible()
  })
})

test.describe('fixtures filters', () => {
  test('filters by competition, switches views and keeps state in the URL', async ({
    page,
    request,
  }) => {
    await page.goto('/fixtures')
    await page.getByRole('button', { name: 'League', exact: true }).click()
    await expect(page).toHaveURL(/competition=league/)
    await expect(page.getByRole('button', { name: 'League', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    const tags = page.locator('article [class*="bg-cyan-tint"]')
    await expect(tags.first()).toBeVisible()
    for (const text of await tags.allTextContents()) expect(text).toBe('State League')

    await page.getByRole('tab', { name: 'Results' }).click()
    await expect(page).toHaveURL(/view=results/)
    await expect(page).toHaveURL(/competition=league/)
    await expect(page.getByText('Full time').first()).toBeVisible()

    await page.getByRole('button', { name: 'Friendly', exact: true }).click()
    await expect(
      page.getByText('No results in this competition yet. Choose All to see every result.'),
    ).toBeVisible()

    await page.getByRole('tab', { name: 'Table' }).click()
    const table = page.getByRole('table')
    await expect(table.locator('tr[aria-current="true"]')).toContainText('Ultimate Rovers')

    const ics = await request.get('/fixtures.ics')
    expect(ics.status()).toBe(200)
    expect(await ics.text()).toMatch(/BEGIN:VCALENDAR[\s\S]*BEGIN:VEVENT/)
  })

  test('works without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto('/fixtures')
    await page.getByRole('button', { name: 'Cup', exact: true }).click()
    await expect(page).toHaveURL(/competition=cup/)
    await expect(page.getByRole('button', { name: 'Cup', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await context.close()
  })
})

test.describe('contact', () => {
  test('preselects the topic, shows field errors, then sends', async ({ page }) => {
    await page.goto('/contact?topic=media')
    await expect(page.getByLabel('Topic')).toHaveValue('media')

    await page.getByRole('button', { name: 'Send message' }).click()
    await expect(page.getByText('Enter your full name.')).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Full name' })).toBeFocused()
    await expect(page.getByRole('textbox', { name: 'Full name' })).toHaveAttribute(
      'aria-invalid',
      'true',
    )

    await page.getByRole('textbox', { name: 'Full name' }).fill('Test Supporter')
    await page.getByLabel('Email', { exact: true }).fill('supporter@example.com')
    await page
      .getByRole('textbox', { name: 'Message' })
      .fill('I would like to request press accreditation for the next home match.')
    await page.getByRole('button', { name: 'Send message' }).click()
    await expect(page.getByText('Message sent')).toBeVisible()
    await expect(page.getByText('Message sent')).toBeFocused()

    await page.getByRole('button', { name: 'Send another message' }).click()
    await expect(page.getByRole('textbox', { name: 'Full name' })).toHaveValue('')
  })

  test('the newsletter form validates and subscribes', async ({ page }) => {
    await page.goto('/contact')
    const footer = page.getByRole('contentinfo')
    await footer.getByLabel('Email address').fill('not-an-email')
    await footer.getByRole('button', { name: 'Subscribe' }).click()
    await expect(footer.getByText('Enter an email address like name@example.com.')).toBeVisible()
    await footer.getByLabel('Email address').fill(`fan-${Date.now()}@example.com`)
    await footer.getByRole('button', { name: 'Subscribe' }).click()
    await expect(
      footer.getByText('You’re subscribed').or(footer.getByText("You're subscribed")),
    ).toBeVisible()
  })

  test('the FAQ accordion keeps one answer open', async ({ page }) => {
    await page.goto('/contact')
    const first = page.getByRole('button', { name: 'How do I buy match tickets?' })
    const second = page.getByRole('button', { name: 'How can my child attend academy trials?' })
    await expect(first).toHaveAttribute('aria-expanded', 'true')
    await second.click()
    await expect(second).toHaveAttribute('aria-expanded', 'true')
    await expect(first).toHaveAttribute('aria-expanded', 'false')
  })
})

test.describe('news', () => {
  test('filters, searches and paginates', async ({ page }) => {
    await page.goto('/news')
    await page.getByRole('button', { name: 'Academy', exact: true }).click()
    await expect(page).toHaveURL(/category=academy/)
    await expect(page.getByRole('link', { name: /Academy trials/ })).toBeVisible()

    await page.goto('/news')
    await page.getByLabel('Search news').fill('nothing-matches-this')
    await page.getByLabel('Search news').press('Enter')
    await expect(page).toHaveURL(/q=nothing-matches-this/)
    await expect(page.getByText(/No stories match/)).toBeVisible()

    await page.goto('/news')
    await page
      .getByRole('navigation', { name: 'Pagination' })
      .getByRole('link', { name: 'Next page' })
      .click()
    await expect(page).toHaveURL(/page=2/)
    await page.locator('main a[href^="/news/"]').first().click()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})

test('unknown pages show the site 404', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
  await expect(page.getByRole('main').getByRole('link', { name: 'Squad' })).toBeVisible()
})

test('health check reports the database', async ({ request }) => {
  const res = await request.get('/api/health')
  expect(res.status()).toBe(200)
  expect(await res.json()).toMatchObject({ status: 'ok', database: 'ok' })
})
