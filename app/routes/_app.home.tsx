import type { LoaderFunctionArgs } from '@vercel/remix'
import { json } from '@vercel/remix'
import { Link, useLoaderData } from '@remix-run/react'
import { getUser } from '~/services/auth.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request)
  return json({ user })
}

const Index = () => {
  const data = useLoaderData<typeof loader>()

  return (
    <div>
      <Link to="/games">My Games</Link>
      <Link to="/collection">My Collection</Link>
    </div>
  )
}

export default Index
