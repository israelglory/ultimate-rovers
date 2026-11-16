import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  // OG images read these at runtime; make sure the standalone server ships them.
  // The seed images ship too, so SEED_ON_EMPTY works inside the container.
  outputFileTracingIncludes: {
    '/**': ['./src/assets/fonts/**', './public/crest.png', './src/seed/images/**'],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  // Do not write AGENTS.md into the repo on `next dev`.
  agentRules: false,
  images: {
    // Payload serves uploads from /api/media/file and /api/documents/file. The crest lives in /public.
    localPatterns: [{ pathname: '/api/media/file/**' }, { pathname: '/crest.png' }],
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 85],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
