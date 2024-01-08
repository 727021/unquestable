import type { LoaderFunctionArgs} from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { getUser } from '~/services/auth.server'
import { prisma } from '~/services/db.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request)

  const allExpansions = await prisma.expansion.findMany()
  const owned = (await prisma.expansion.findMany({
    where: {
      owners: {
        some: {
          id: user.id
        }
      }
    },
    select: {
      id: true
    }
  })).map(({ id }) => id)

  return json({ allExpansions, owned })
}

const Collection = () => {
  const data = useLoaderData<typeof loader>()

  return (
    <div>
      <h1>My Collection</h1>
      <ul>
        {data.allExpansions.map(expansion => (
          <li key={expansion.id}>
            {data.owned.includes(expansion.id) ? '🟩' : '🟥'}
            {expansion.name}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Collection