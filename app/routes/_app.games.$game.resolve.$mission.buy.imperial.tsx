import { MissionStage } from '@prisma/client'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { useLoaderData, useOutletContext } from '@remix-run/react'
import { prisma } from '~/services/db.server'
import type { LoaderData as GameLoaderData } from './_app.games.$game'
import { withZod } from '@remix-validated-form/with-zod'
import { zfd } from 'zod-form-data'
import { z } from 'zod'
import { ValidatedForm } from 'remix-validated-form'
import SubmitButton from '~/components/SubmitButton'
import BuyClassCard from '~/components/BuyClassCard'
import BuyAgendaCard from '~/components/BuyAgendaCard'

const validator = withZod(
  zfd.formData({
    classCards: zfd.repeatable(z.array(zfd.numeric(z.number().positive()))),
    agendas: zfd
      .repeatable(z.array(zfd.numeric(z.number().positive())))
      .optional()
      .default([])
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

const BuyStage = () => {
  const data = useLoaderData<typeof loader>()
  const ctx = useOutletContext<GameLoaderData>()

  const imperialPlayer = ctx.game.imperialPlayer!

  const unownedAgendas = imperialPlayer.agendaDecks
    .map((d) => d.agendas)
    .flat()
    .filter((a) => !imperialPlayer.agendas.some((o) => o.id === a.id))

  return (
    <>
      <h2 className="m-0">
        Imperial Buy for <em>{data.mission.name}</em>
      </h2>
      <ValidatedForm
        validator={validator}
        method="POST"
        className="flex flex-col gap-3 w-fit"
      >
        <div className="flex flex-wrap gap-3">
          <BuyClassCard
            xp={imperialPlayer.xp}
            cards={imperialPlayer.class.cards}
            label={imperialPlayer.class.name}
            owned={imperialPlayer.classCards}
            name="classCards"
          />
          <BuyAgendaCard
            influence={imperialPlayer.influence}
            cards={unownedAgendas}
            name="agendas"
            label="Agenda Cards"
          />
        </div>
        <SubmitButton className="w-fit">Buy</SubmitButton>
      </ValidatedForm>
    </>
  )
}

export default BuyStage
