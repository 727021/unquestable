import { vitePlugin as remix } from '@remix-run/dev'
import { installGlobals } from '@remix-run/node'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { vercelPreset } from '@vercel/remix/vite'
import { createRequire } from 'node:module'
import path from 'node:path'

installGlobals()

const { resolve } = createRequire(import.meta.url)
const prismaClient = `prisma${path.sep}client`
const prismaClientIndexBrowser = resolve('@prisma/client/index-browser').replace(`@${prismaClient}`, `.${prismaClient}`)

export default defineConfig({
  server: {
    port: 3000
  },
  plugins: [
    remix({
      presets: [vercelPreset()],
      ignoredRouteFiles: ['**/.*']
    }),
    tsconfigPaths()
  ],
  resolve: {
    alias: {
      '.prisma/client/index-browser': path.relative(__dirname, prismaClientIndexBrowser)
    }
  }
})
