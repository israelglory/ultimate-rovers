import type { CollectionConfig } from 'payload'

import { Articles } from './Articles'
import { Competitions } from './Competitions'
import { ContactSubmissions } from './ContactSubmissions'
import { Documents } from './Documents'
import { Honours } from './Honours'
import { Matches } from './Matches'
import { Media } from './Media'
import { NewsletterSubscribers } from './NewsletterSubscribers'
import { Partners } from './Partners'
import { People } from './People'
import { Players } from './Players'
import { Teams } from './Teams'
import { TimelineEntries } from './TimelineEntries'
import { Users } from './Users'
import { Videos } from './Videos'

export const collections: CollectionConfig[] = [
  Matches,
  Competitions,
  Teams,
  Players,
  Articles,
  Videos,
  Media,
  People,
  Partners,
  Honours,
  TimelineEntries,
  Documents,
  ContactSubmissions,
  NewsletterSubscribers,
  Users,
]
