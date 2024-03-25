import { MissionStage } from '@prisma/client'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { useLoaderData, useOutletContext } from '@remix-run/react'
import { prisma } from '~/services/db.server'
import type { LoaderData as GameLoaderData } from './_app.games.$game'
import { ValidatedForm } from 'remix-validated-form'
import { withZod } from '@remix-validated-form/with-zod'
import { zfd } from 'zod-form-data'
import BuyClassCard from '~/components/BuyClassCard'
import { Fragment } from 'react'
import SubmitButton from '~/components/SubmitButton'
import { z } from 'zod'

const validator = withZod(
  zfd.formData({
    rebels: zfd.repeatable(
      z.array(
        z.object({
          id: zfd.numeric(z.number().positive()),
          cards: zfd.repeatable(z.array(zfd.numeric(z.number().positive())))
        })
      )
    )
  })
)

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

export const action = async ({ request }: ActionFunctionArgs) => {
  const { data, error } = await validator.validate(await request.formData())
  console.log(data)

  return json({ data, error })
}

const BuyStage = () => {
  const data = useLoaderData<typeof loader>()
  const ctx = useOutletContext<GameLoaderData>()
  console.log(ctx)

  // REBEL
  // buy class cards
  // buy items
  // sell items

  // list of checkboxes for buy and sell?
  // disable if not selected and not affordable

  return (
    <>
      <h2 className="m-0">
        Rebel Buy for <em>{data.mission.name}</em>
      </h2>
      <ValidatedForm validator={validator} method="POST">
        <div className="flex flex-wrap gap-3">
          {ctx.game.rebelPlayers.map((rebel, i) => (
            <>
              <BuyClassCard
                xp={rebel.xp}
                cards={rebel.hero.class!.cards.filter(
                  (c) => !rebel.classCards.some((cc) => cc.id === c.id)
                )}
                label={rebel.hero.name}
                name={`rebels[${i}].cards`}
              />
              <input type="hidden" name={`rebels[${i}].id`} value={rebel.id} />
            </>
          ))}
        </div>
        <SubmitButton>Buy</SubmitButton>
      </ValidatedForm>
    </>
  )
}

export default BuyStage
