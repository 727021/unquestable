import type { LoaderFunctionArgs } from '@remix-run/node'
import { Outlet, json, useLoaderData } from '@remix-run/react'
import { getUser } from '~/services/auth.server'
import Footer from '~/components/Footer'
import AppNav from '~/components/AppNav'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request)
  return json({ user })
}

const App = () => {
  const data = useLoaderData<typeof loader>()

  return (
    <div className="min-h-screen flex flex-col">
      <AppNav user={data.user} />
      <main className="grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default App
