import type { LoaderFunctionArgs } from '@remix-run/cloudflare'
import { Link, Outlet } from '@remix-run/react'
import { getUser } from '~/services/auth.server'

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  await getUser(request, context)
  return null
}

const App = () => {
  return (
    <div>
      <Link to="/logout">Log out</Link>
      {/* TODO: Common layout */}
      <Outlet />
    </div>
  )
}

export default App
