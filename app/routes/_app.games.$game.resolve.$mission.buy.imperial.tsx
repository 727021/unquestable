import { MissionStage } from '@prisma/client'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { useLoaderData, useOutletContext } from '@remix-run/react'
import { prisma } from '~/services/db.server'
import type { LoaderData as GameLoaderData } from './_app.games.$game'

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const forcedMission = await prisma.gameMission.findFirst({
    where: {
      gameId: parseInt(params.game!, 10),
      stage: {
        equals: undefined
      },
      forced: true
    },
    select: {
      id: true
    }
  })

  if (forcedMission) {
    return redirect(`/games/${params.game}`)
  }

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
  const ctx = useOutletContext<GameLoaderData>()

  // EMPIRE
  // buy class cards
  // buy agendas

  // list of checkboxes for buy and sell?
  // disable if not selected and not affordable

  return (
    <>
      <h2 className="m-0">
        Imperial Buy for <em>{data.mission.name}</em>
      </h2>
    </>
  )
}

export default BuyStage
