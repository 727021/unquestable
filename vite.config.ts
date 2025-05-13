import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { vercelPreset } from '@vercel/remix/vite'
import { createRequire } from 'node:module'
import path from 'node:path'

const { resolve } = createRequire(import.meta.url)
const prismaClient = `prisma${path.sep}client`
const prismaClientIndexBrowser = resolve(
  '@prisma/client/index-browser'
).replace(`@${prismaClient}`, `.${prismaClient}`)

export default defineConfig({
  server: {
    port: 3000
  },
  plugins: [
    remix({
      presets: [vercelPreset()],
      ignoredRouteFiles: ['**/.*'],
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
        v3_singleFetch: true,
        v3_routeConfig: true
      }
    }),
    tsconfigPaths()
  ],
  resolve: {
    alias: {
      '.prisma/client/index-browser': path.relative(
        __dirname,
        prismaClientIndexBrowser
      )
    }
  }
})
