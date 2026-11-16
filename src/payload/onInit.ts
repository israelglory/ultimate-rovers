import type { Payload } from 'payload'

/**
 * With SEED_ON_EMPTY=true, a fresh install fills itself with placeholder content on first boot.
 * It only runs while the database has no matches and no players, so it never touches real content.
 */
export const onInit = async (payload: Payload): Promise<void> => {
  if (process.env.SEED_ON_EMPTY !== 'true') return
  const [matches, players] = await Promise.all([
    payload.count({ collection: 'matches', overrideAccess: true }),
    payload.count({ collection: 'players', overrideAccess: true }),
  ])
  if (matches.totalDocs > 0 || players.totalDocs > 0) return
  payload.logger.info('SEED_ON_EMPTY: empty database, adding placeholder content.')
  const { seed } = await import('../seed')
  await seed(payload)
}
