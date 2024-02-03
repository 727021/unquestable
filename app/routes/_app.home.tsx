import type { LoaderFunctionArgs} from '@remix-run/node';
import { json } from '@remix-run/node'
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
      <Link to="">My Games</Link>
      <Link to="">My Collection</Link>
    </div>
  )
}

export default Index
