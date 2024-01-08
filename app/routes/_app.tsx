import type { LoaderFunctionArgs} from '@remix-run/node'
import { Link, Outlet } from '@remix-run/react'
import { getUser } from '~/services/auth.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await getUser(request)
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
