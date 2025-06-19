import { MissionStage } from '@prisma/client'
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'
import { redirect } from 'react-router'
import { useLoaderData, useOutletContext } from 'react-router'
import { prisma } from '~/services/db.server'
import type { LoaderData as GameLoaderData } from './_app.games.$game'
import { z } from 'zod'
import { parseFormData, useForm, validationError } from '@rvf/react-router'
import SubmitButton from '~/components/SubmitButton'
import BuyClassCard from '~/components/BuyClassCard'
import BuyAgendaCard from '~/components/BuyAgendaCard'
import { useId } from 'react'

const schema = z.object({
  classCards: z.array(z.coerce.number().positive()),
  agendas: z.array(z.coerce.number().positive()).optional().default([])
})

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const forcedMission = await prisma.gameMission.findFirst({
    where: {
      gameId: parseInt(params.game!, 10),
      stage: {
        equals: null
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

  return mission
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { data, error } = await parseFormData(await request.formData(), schema)

  if (error) {
    return validationError(error)
  }

  // const game = ...

  const mission = await prisma.gameMission.findUnique({
    where: {
      id: parseInt(params.mission!, 10),
      stage: MissionStage.IMPERIAL_BUY
    },
    select: {
      id: true,
      threat: true
    }
  })

  if (!mission) {
    return redirect(`/games/${params.game}`)
  }

  const agendas = await prisma.agenda.findMany({
    where: {
      id: {
        in: data.agendas
      }
    }
  })
  const agendasCost = agendas.reduce((cost, a) => cost + a.cost, 0)

  const classCardCost = await prisma.classCard.aggregate({
    _sum: {
      cost: true
    },
    where: {
      id: {
        in: data.classCards
      }
    }
  })

  // TODO: Validate player can afford agendas and class cards

  for (const agenda of agendas) {
    if (agenda.missionId) {
      await prisma.gameMission.create({
        data: {
          gameId: parseInt(params.game!, 10),
          missionId: agenda.missionId
        }
      })
    } else if (agenda.forcedMissionId) {
      await prisma.gameMission.create({
        data: {
          gameId: parseInt(params.game!, 10),
          missionId: agenda.forcedMissionId,
          forced: true,
          threat: mission.threat
        }
      })
    }
  }

  await prisma.gameMission.update({
    where: {
      id: parseInt(params.mission!, 10)
    },
    data: {
      stage: MissionStage.RESOLVED,
      game: {
        update: {
          imperialPlayer: {
            update: {
              agendas: {
                create: agendas.map((a) => ({ agendaId: a.id }))
              },
              influence: {
                decrement: agendasCost
              },
              xp: {
                decrement: classCardCost._sum.cost ?? 0
              },
              classCards: {
                connect: data.classCards.map((c) => ({ id: c }))
              }
            }
          }
        }
      }
    }
  })

  return redirect(`/games/${params.game}`)
}

const BuyStage = () => {
  const data = useLoaderData<typeof loader>()
  const ctx = useOutletContext<GameLoaderData>()

  const imperialPlayer = ctx.game.imperialPlayer!

  const unownedAgendas = imperialPlayer.agendaDecks
    .map((d) => d.agendas)
    .flat()
    .filter((a) => !imperialPlayer.agendas.some((o) => o.agendaId === a.id))

  const formId = useId()
  const form = useForm({
    id: formId,
    schema,
    method: 'POST',
    defaultValues: {
      classCards: []
    }
  })

  return (
    <>
      <h2 className="m-0">
        Imperial Buy for <em>{data.mission.name}</em>
      </h2>
      <form {...form.getFormProps()} className="flex flex-col gap-3 w-fit">
        {form.renderFormIdInput()}
        <div className="flex flex-wrap gap-3">
          <BuyClassCard
            formApi={form}
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
        <SubmitButton formApi={form} className="w-fit">
          Buy
        </SubmitButton>
      </form>
    </>
  )
}

export default BuyStage
