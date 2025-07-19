import { useFormAction, useLoaderData, useOutletContext } from 'react-router'
import type { LoaderData as GameLoaderData } from './_app.games.$game'
import AgendaManager from '~/components/AgendaManager'
import ImperialClassManager from '~/components/ImperialClassManager'
import ImperialSummaryManager from '~/components/ImperialSummaryManager'
import type { LoaderFunctionArgs } from 'react-router'
import { prisma } from '~/services/db.server'
import { Side } from '@prisma/client'
import ImperialRewardManager from '~/components/ImperialRewardManager'
import VillainManager from '~/components/VillainManager'
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
        in: [Side.ALL, Side.IMPERIAL]
      }
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

  return { rewards, troops }
}

export type LoaderData = ReturnType<typeof useLoaderData<typeof loader>>

const Empire = () => {
  const data = useOutletContext<GameLoaderData>()
  const imperialPlayer = data.game.imperialPlayer!

  const loaderData = useLoaderData<LoaderData>()

  const summaryFormAction = useFormAction('summary')
  const classFormAction = useFormAction('class')
  const agendasFormAction = useFormAction('agendas')
  const rewardsFormAction = useFormAction('rewards')
  const villainsFormAction = useFormAction('villains')

  return (
    <>
      <div className="flex flex-col flex-1 gap-2">
        <div className="flex gap-3 items-baseline">
          <h2 className="m-0">Empire</h2>
        </div>
        <ImperialSummaryManager
          imperialPlayer={imperialPlayer}
          formAction={summaryFormAction}
        />
        <div className="flex flex-wrap gap-2">
          <ImperialClassManager
            imperialPlayer={imperialPlayer}
            formAction={classFormAction}
          />
          <AgendaManager
            imperialPlayer={imperialPlayer}
            formAction={agendasFormAction}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <ImperialRewardManager
            imperialPlayer={imperialPlayer}
            allRewards={loaderData.rewards}
            formAction={rewardsFormAction}
          />
          <VillainManager
            imperialPlayer={imperialPlayer}
            allVillains={loaderData.troops}
            formAction={villainsFormAction}
          />
        </div>
      </div>
    </>
  )
}

export default Empire
