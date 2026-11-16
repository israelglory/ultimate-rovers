/**
 * CLI entry:
 *   pnpm seed               empty database only
 *   pnpm seed:reset         replace all content, keep user accounts
 *   pnpm seed:reset live    also add a match in progress
 * `payload run` only forwards positional words, so options are plain words, not --flags.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { seed } from './index'

const args = new Set(process.argv.slice(2).map((a) => a.replace(/^--/, '')))
const payload = await getPayload({ config })
try {
  await seed(payload, { reset: args.has('reset'), live: args.has('live') })
  process.exit(0)
} catch (error) {
  payload.logger.error({ err: error }, 'Seed failed')
  process.exit(1)
}
