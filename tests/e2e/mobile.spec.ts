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
