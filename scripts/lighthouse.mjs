/**
 * Mobile Lighthouse run (simulated mid-range phone on 4G) for the pages with performance targets.
 * Usage: start a production server, then `BASE_URL=http://127.0.0.1:3100 pnpm lighthouse`.
 * Uses `npx lighthouse` so it is not a project dependency. Set CHROME_PATH if Chrome is not found.
 * Fails if any category is below 90, LCP is 2.5 s or more, or CLS is 0.1 or more.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const base = (process.env.BASE_URL ?? 'http://127.0.0.1:3100').replace(/\/$/, '')
const outDir = path.resolve('lighthouse-reports')
mkdirSync(outDir, { recursive: true })

async function firstHref(page, prefix) {
  const html = await fetch(`${base}${page}`).then((r) => r.text())
  const match = html.match(new RegExp(`href="(${prefix}[^"?#]+)"`))
  if (!match) throw new Error(`No link starting with ${prefix} on ${page}`)
  return match[1]
}

const pages = [
  ['home', '/'],
  ['fixtures', '/fixtures'],
  ['match-centre', await firstHref('/fixtures?view=results', '/matches/')],
  ['player', await firstHref('/squad', '/squad/')],
]

let failed = false
for (const [name, route] of pages) {
  const out = path.join(outDir, `${name}.json`)
  execFileSync(
    'npx',
    [
      '-y',
      'lighthouse@13.6.0',
      `${base}${route}`,
      '--quiet',
      '--output=json',
      `--output-path=${out}`,
      '--chrome-flags=--headless=new --no-sandbox',
      '--only-categories=performance,accessibility,best-practices,seo',
    ],
    { stdio: 'inherit' },
  )
  const lhr = JSON.parse(readFileSync(out, 'utf8'))
  const scores = Object.fromEntries(
    Object.entries(lhr.categories).map(([k, v]) => [k, Math.round(v.score * 100)]),
  )
  const lcp = lhr.audits['largest-contentful-paint'].numericValue / 1000
  const cls = lhr.audits['cumulative-layout-shift'].numericValue
  const tbt = lhr.audits['total-blocking-time'].numericValue
  const ok = Object.values(scores).every((s) => s >= 90) && lcp < 2.5 && cls < 0.1
  if (!ok) failed = true
  console.log(
    `${ok ? 'PASS' : 'FAIL'} ${name.padEnd(13)} ${route}\n     ${Object.entries(scores)
      .map(([k, v]) => `${k} ${v}`)
      .join(', ')}, LCP ${lcp.toFixed(2)}s, CLS ${cls.toFixed(3)}, TBT ${Math.round(tbt)}ms`,
  )
}
process.exit(failed ? 1 : 0)
