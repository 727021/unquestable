import type { LinksFunction, LoaderFunction } from '@vercel/remix'
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from '@remix-run/react'
import { rootAuthLoader } from '@clerk/remix/ssr.server'

import stylesheet from '~/tailwind.css?url'
import { useTheme } from './context/theme-context'
import { ClerkApp } from '@clerk/remix'

export const loader: LoaderFunction = (args) => rootAuthLoader(args)

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet }
]

export function Layout({ children }: { children: React.ReactNode }) {
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
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

function App() {
  return <Outlet />
}

export default ClerkApp(App)
