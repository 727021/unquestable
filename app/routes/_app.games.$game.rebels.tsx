import { json, useLoaderData, useOutletContext } from '@remix-run/react'
import type { LoaderData as GameLoaderData } from './_app.games.$game'
import RebelSummaryManager from '~/components/RebelSummaryManager'
import RebelClassManager from '~/components/RebelClassManager'
import RebelRewardManager from '~/components/RebelRewardManager'
import AllyManager from '~/components/AllyManager'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { getUser } from '~/services/auth.server'
import { prisma } from '~/services/db.server'
import { Side } from '@prisma/client'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request)

  const rewards = await prisma.reward.findMany({
    where: {
      OR: [
        {
          expansionId: {
            in: user.collection.map((c) => c.id)
          }
        },
        {
          expansion: {
            defaultOwned: true
          }
        }
      ],
      side: {
        in: [Side.ALL, Side.REBEL]
      }
    },
    select: {
      id: true,
      name: true,
      tagline: true
    }
  })

  const troops = await prisma.troop.findMany({
    where: {
      OR: [
        {
          expansionId: {
            in: user.collection.map((c) => c.id)
          }
        },
        {
          expansion: {
            defaultOwned: true
          }
        }
      ]
    }
  })

  return json({ rewards, troops })
}

export type LoaderData = ReturnType<typeof useLoaderData<typeof loader>>

const Rebels = () => {
  const data = useOutletContext<GameLoaderData>()

  const loaderData = useLoaderData<LoaderData>()

  return (
    <>
      <div className="flex flex-col flex-1 gap-2">
        <h2 className="m-0">Rebels</h2>
        <div className="grid grid-cols-2 gap-2 flex-1">
          {data.game.rebelPlayers.map((rebel) => (
            <div
              key={rebel.id}
              className="flex flex-col flex-1 px-2 py-1 gap-2 border border-gray-400 rounded"
            >
              <RebelSummaryManager rebel={rebel} />
              <hr className="border-gray-400 my-0" />
              <RebelClassManager rebel={rebel} />
              {rebel.rewards.length > 0 && (
                <>
                  <hr className="border-gray-400 my-0" />
                  <RebelRewardManager rebel={rebel} />
                </>
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-col flex-1 px-2 py-1 gap-2 border border-gray-400 rounded">
          Items
        </div>
        <AllyManager allies={data.game.allies} allAllies={loaderData.troops} />
      </div>
    </>
  )
}

export default Rebels
