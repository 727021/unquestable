import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { getUser } from '~/services/auth.server'
import { prisma } from '~/services/db.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request)
  const games = await prisma.game.findMany({
    where: {
      userId: user.id
    },
    include: {
      campaign: true,
      rebelPlayers: {
        include: {
          hero: true
        }
      },
      imperialPlayer: true
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
    <div className="prose max-w-full">
      <h1 className="m-0">Games</h1>
      {games.length ? (
        <>
          <Link to="/games/new" className="link-hover">
            New Game
          </Link>
          <div className="flex gap-2 p-2 flex-wrap max-w-full">
            {games.map((game) => (
              <Link
                key={game.id}
                to={`/games/${game.id}`}
                className="card card-compact card-bordered no-underline shadow-md hover:shadow-lg w-64 max-w-full"
              >
                <div className="card-body w-full">
                  <h2 className="card-title m-0">{game.name}</h2>
                  <div className="flex justify-between">
                    <span>{game.campaign.name}</span>
                    <span>{new Date(game.started).toDateString()}</span>
                  </div>
                  <dl className="m-0">
                    <dt className="m-0">Heroes</dt>
                    {game.rebelPlayers.map((p) => (
                      <dd key={p.id}>
                        {p.hero.name}
                        {p.name && ` (${p.name})`}
                      </dd>
                    ))}
                    {game.imperialPlayer?.name && (
                      <>
                        <dt className="m-0">Imperial</dt>
                        <dd>{game.imperialPlayer.name}</dd>
                      </>
                    )}
                  </dl>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <>
          <p>
            There's nothing here! Start a <Link to="/games/new">New Game</Link>.
          </p>
        </>
      )}
    </div>
  )
}

export default Games
