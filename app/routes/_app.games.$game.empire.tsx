import clsx from 'clsx'
import {
  json,
  useFetcher,
  useFormAction,
  useLoaderData,
  useOutletContext
} from '@remix-run/react'
import type { LoaderData as GameLoaderData } from './_app.games.$game'
import type { ActionData } from './_app.games.$game.empire.agendas'
import AgendaManager from '~/components/AgendaManager'
import ImperialClassManager from '~/components/ImperialClassManager'
import ImperialSummaryManager from '~/components/ImperialSummaryManager'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { prisma } from '~/services/db.server'
import { getUser } from '~/services/auth.server'
import { Side } from '@prisma/client'
import ImperialRewardManager from '~/components/ImperialRewardManager'

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
        in: [Side.ALL, Side.IMPERIAL]
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

const Empire = () => {
  const data = useOutletContext<GameLoaderData>()
  const imperialPlayer = data.game.imperialPlayer!

  const loaderData = useLoaderData<LoaderData>()

  const summaryFetcher = useFetcher<ActionData>()
  const summaryFormAction = useFormAction('summary')

  const classFetcher = useFetcher<ActionData>()
  const classFormAction = useFormAction('class')

  const agendaFetcher = useFetcher<ActionData>()
  const agendasFormAction = useFormAction('agendas')

  const rewardsFetcher = useFetcher<ActionData>()
  const rewardsFormAction = useFormAction('rewards')

  return (
    <>
      <div className="flex flex-col flex-1 gap-2">
        <div className="flex gap-3 items-baseline">
          <h2 className="m-0">Empire</h2>
        </div>
        <ImperialSummaryManager
          imperialPlayer={imperialPlayer}
          fetcher={summaryFetcher}
          formAction={summaryFormAction}
        />
        <div className="flex flex-wrap gap-2">
          <ImperialClassManager
            imperialPlayer={imperialPlayer}
            fetcher={classFetcher}
            formAction={classFormAction}
          />
          <AgendaManager
            imperialPlayer={imperialPlayer}
            fetcher={agendaFetcher}
            formAction={agendasFormAction}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <ImperialRewardManager
            imperialPlayer={imperialPlayer}
            allRewards={loaderData.rewards}
            fetcher={rewardsFetcher}
            formAction={rewardsFormAction}
          />
          <div className="flex flex-col flex-1 px-2 pb-1 border border-gray-400 rounded">
            <h2 className="m-0">Villains</h2>
            {!imperialPlayer.villains.length ? (
              <p className="m-0">No Villains</p>
            ) : (
              <div className="flex flex-col items-start w-fit-py-2">
                {imperialPlayer.villains.map((villain) => (
                  <p
                    className={clsx('m-0', villain.elite && 'text-red-600')}
                    key={villain.id}
                  >
                    {villain.name}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Empire
