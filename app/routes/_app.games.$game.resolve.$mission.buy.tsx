import { MissionStage } from '@prisma/client'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { useLoaderData, useOutletContext } from '@remix-run/react'
import { prisma } from '~/services/db.server'

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const mission = await prisma.gameMission.findUnique({
    where: {
      id: parseInt(params.mission!, 10),
      stage: {
        in: [MissionStage.REBEL_BUY, MissionStage.IMPERIAL_BUY]
      },
      // Forced missions don't get their own buy stage
      forced: false
    },
    select: {
      id: true,
      mission: {
        select: {
          id: true,
          type: true,
          name: true
        }
      }
    }
  })

  if (!mission) {
    return redirect(`/games/${params.game}`)
  }

  return json(mission)
}

const BuyStage = () => {
  const data = useLoaderData<typeof loader>()
  const ctx = useOutletContext()
  console.log(ctx)

  // REBEL
  // buy class cards
  // buy items
  // sell items

  // EMPIRE
  // buy class cards
  // buy agendas

  // list of checkboxes for buy and sell?
  // disable if not selected and not affordable

  return (
    <>
      <h2 className="m-0">
        Resolving <em>{data.mission.name}</em>
      </h2>
      <div className="flex flex-wrap gap-2">
        <div className="flex flex-col flex-1">
          <h3 className="m-0">Rebels</h3>
        </div>
        <div className="flex flex-col flex-1">
          <h3 className="m-0">Empire</h3>
        </div>
      </div>
    </>
  )
}

export default BuyStage
