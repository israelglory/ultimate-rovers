import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { collections } from './payload/collections'
import { globals } from './payload/globals'
import { onInit } from './payload/onInit'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const env = (name: string): string | undefined => {
  const value = process.env[name]
  return value && value.trim() !== '' ? value : undefined
}

const siteUrl = env('SITE_URL') ?? 'http://localhost:3000'

const emailAdapter = env('SMTP_HOST')
  ? nodemailerAdapter({
      defaultFromAddress: env('EMAIL_FROM_ADDRESS') ?? 'no-reply@example.com',
      defaultFromName: env('EMAIL_FROM_NAME') ?? 'Ultimate Rovers',
      transportOptions: {
        host: env('SMTP_HOST'),
        port: Number(env('SMTP_PORT') ?? 587),
        secure: env('SMTP_SECURE') === 'true',
        auth: env('SMTP_USER') ? { user: env('SMTP_USER'), pass: env('SMTP_PASS') } : undefined,
      },
    })
  : undefined

export default buildConfig({
  serverURL: siteUrl,
  secret: env('PAYLOAD_SECRET') ?? '',
  admin: {
    user: 'users',
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' | Ultimate Rovers admin' },
    timezones: {
      defaultTimezone: 'Europe/London',
    },
  },
  collections,
  globals,
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: { connectionString: env('DATABASE_URL') ?? '' },
    // Development syncs the schema automatically. Production applies committed migrations on boot.
    push: process.env.NODE_ENV !== 'production',
    migrationDir: path.resolve(dirname, 'migrations'),
    prodMigrations: migrations,
  }),
  email: emailAdapter,
  sharp,
  graphQL: { disable: true },
  csrf: [siteUrl],
  cors: [siteUrl],
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  telemetry: false,
  plugins: [
    s3Storage({
      enabled: Boolean(env('S3_BUCKET')),
      collections: { media: true },
      bucket: env('S3_BUCKET') ?? '',
      config: {
        region: env('S3_REGION') ?? 'auto',
        endpoint: env('S3_ENDPOINT'),
        forcePathStyle: env('S3_FORCE_PATH_STYLE') !== 'false',
        credentials: {
          accessKeyId: env('S3_ACCESS_KEY_ID') ?? '',
          secretAccessKey: env('S3_SECRET_ACCESS_KEY') ?? '',
        },
      },
    }),
  ],
  onInit,
})
