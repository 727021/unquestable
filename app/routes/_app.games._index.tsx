import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { getUser } from '~/services/auth.server'
import { prisma } from '~/services/db.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request)
  const games = await prisma.game.findMany({
    where: {
      owner: user
    },
    include: {
      campaign: true,
      rebelPlayers: {
        include: {
          hero: true
        }
      },
      missions: {
        include: {
          mission: true
        },
        where: {
          resolved: false
        },
      }
    },
    orderBy: {
      started: 'desc'
    }
  })

  return json({ games })
}

const Games = () => {
  const { games } = useLoaderData<typeof loader>()

  return (
    <div>
      <h1>Games</h1>
      {games.length ? (
        <>
          <Link to="/games/new">New Game</Link>
        </>
      ) : (
        <>
          <p>There's nothing here! Start a <Link to="/games/new">New Game</Link>.</p>
        </>
      )}
    </div>
  )
}

export default Games