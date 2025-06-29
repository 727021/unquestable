import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import devtoolsJson from 'vite-plugin-devtools-json'
import tailwindcss from '@tailwindcss/vite'
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
  plugins: [reactRouter(), tsconfigPaths(), devtoolsJson(), tailwindcss()],
  resolve: {
    alias: {
      '.prisma/client/index-browser': path.relative(
        __dirname,
        prismaClientIndexBrowser
      )
    }
  }
})
