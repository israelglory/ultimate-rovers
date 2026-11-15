import 'server-only'

import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

/** The Payload local API. getPayload caches the instance per process. */
export function getPayloadClient(): Promise<Payload> {
  return getPayload({ config })
}
