import type { Prisma } from '@prisma/client'
import type { LoaderFunctionArgs} from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'
import { authenticator } from '~/services/auth.server'

export type LoaderData = {
  user: Prisma.UserGetPayload<null>
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login'
  })

  return json({ user })
}

const App = () => {
  const loaderData = useLoaderData<LoaderData>()

  return (
    <div>
      <Link to="/logout">Log out</Link>
      {/* TODO: Common layout */}
      <Outlet context={loaderData} />
    </div>
  )
}

export default App
