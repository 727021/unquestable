import { useFormAction, useLoaderData, useOutletContext } from 'react-router'
import type { LoaderData as GameLoaderData } from './_app.games.$game'
import RebelSummaryManager from '~/components/RebelSummaryManager'
import RebelClassManager from '~/components/RebelClassManager'
import RebelRewardManager from '~/components/RebelRewardManager'
import AllyManager from '~/components/AllyManager'
import type { LoaderFunctionArgs } from 'react-router'
import { prisma } from '~/services/db.server'
import { Side } from '@prisma/client'
import ItemManager from '~/components/ItemManager'
import { requireAuth } from '~/utils/requireAuth.server'

export const loader = async (args: LoaderFunctionArgs) => {
  const { userId } = await requireAuth(args)

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId
    },
    include: {
      collection: {
        select: {
          id: true
        }
      }
    }
  })

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

  const items = await prisma.item.findMany({
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

  return { rewards, troops, items }
}

export type LoaderData = ReturnType<typeof useLoaderData<typeof loader>>

const Rebels = () => {
  const data = useOutletContext<GameLoaderData>()
  data.game.rebelPlayers.sort((a, b) => a.hero.name.localeCompare(b.hero.name))

  const loaderData = useLoaderData<LoaderData>()

  const summaryFormAction = useFormAction('summary')
  const classFormAction = useFormAction('class')
  const rewardFormAction = useFormAction('rewards')
  const allyFormAction = useFormAction('allies')
  const itemFormAction = useFormAction('items')

  return (
    <>
      <div className="flex flex-col flex-1 gap-2">
        <h2 className="m-0">Rebels</h2>
        <div className="grid grid-cols-2 gap-2 flex-1">
          {data.game.rebelPlayers.map((rebel) => (
            <div
              key={rebel.id}
              className="flex flex-col flex-1 px-2 py-1 gap-2 border border-gray-400 rounded-xs"
            >
              <RebelSummaryManager
                rebel={rebel}
                formAction={summaryFormAction}
              />
              <hr className="border-gray-400 my-0 not-prose" />
              <RebelClassManager rebel={rebel} formAction={classFormAction} />
              <hr className="border-gray-400 my-0 not-prose" />
              <RebelRewardManager
                rebel={rebel}
                formAction={rewardFormAction}
                allRewards={loaderData.rewards}
              />
            </div>
          ))}
          <ItemManager
            items={data.game.items}
            allItems={loaderData.items}
            credits={data.game.credits}
            formAction={itemFormAction}
          />
          <AllyManager
            allies={data.game.allies}
            allAllies={loaderData.troops}
            formAction={allyFormAction}
          />
        </div>
      </div>
    </>
  )
}

export default Rebels
