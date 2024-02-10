import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { getUser } from '~/services/auth.server'
import { prisma } from '~/services/db.server'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await getUser(request)

  if (!params.game) {
    throw new Response(null, { status: 404 })
  }
  const gameId = parseInt(params.game, 10)
  if (isNaN(gameId)) {
    throw new Response(null, { status: 404 })
  }

  const game = await prisma.game.findUnique({
    where: {
      id: gameId,
      userId: user.id
    }
  })

  if (!game) {
    throw new Response(null, { status: 404 })
  }

  return json({ game })
}

const Game = () => {
  const data = useLoaderData<typeof loader>()

  return <pre>{JSON.stringify(data.game, null, 2)}</pre>
}

export default Game
