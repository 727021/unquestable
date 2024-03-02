import type { LoaderFunctionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { useLoaderData, useOutletContext } from '@remix-run/react'
import { prisma } from '~/services/db.server'

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const mission = await prisma.gameMission.findUnique({
    where: {
      id: parseInt(params.mission!, 10),
      imperialBuyComplete: false
    },
    select: {
      id: true,
      forced: true,
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

  return (
    <>
      <h2 className="m-0">
        Resolving <em>{data.mission.name}</em>
      </h2>
    </>
  )
}

export default BuyStage
