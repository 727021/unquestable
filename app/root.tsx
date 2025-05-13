import type { LinksFunction, LoaderFunction, Route } from 'react-router'
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData
} from 'react-router'
import { rootAuthLoader } from '@clerk/react-router/ssr.server'
import stylesheet from '~/tailwind.css?url'
import { useTheme } from './context/theme-context'
import { ClerkProvider } from '@clerk/react-router'
import { Analytics } from '@vercel/analytics/react'

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
        <Analytics />
      </body>
    </html>
  )
}

export default function App() {
  const loaderData = useLoaderData()

  return (
    <ClerkProvider loaderData={loaderData}>
      <Outlet />
    </ClerkProvider>
  )
}
