import type { LinksFunction } from '@vercel/remix'
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from '@remix-run/react'

import stylesheet from '~/tailwind.css?url'
import { useTheme } from './context/theme-context'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet }
]

export default function App() {
  const { theme } = useTheme()

  return (
    <html lang="en" data-theme={theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
