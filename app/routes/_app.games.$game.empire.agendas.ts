import { redirect } from 'react-router'
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router'
import { prisma } from '~/services/db.server'
import { z } from 'zod'
import { requireAuth } from '~/utils/requireAuth.server'
import { parseFormData } from '@rvf/react-router'

export type ActionData = { success?: number }

export const loader = async ({ params }: LoaderFunctionArgs) => {
  return redirect(`/games/${params.game}/empire`)
}

export const agendaSchema = z.object({
  agendas: z
    .array(
      z.object({
        id: z.coerce.number().int().positive(),
        discarded: z.preprocess(
          (val) => val === 'true' || val === true,
          z.boolean()
        )
      })
    )
    .default([])
})

export const action = async (args: ActionFunctionArgs) => {
  const { data, submittedData, error } = await parseFormData(
    await args.request.formData(),
    agendaSchema
  )

  console.log({ data, submittedData, error })

  const { userId } = await requireAuth(args)
  const gameId = parseInt(args.params.game!, 10)

  const player = await prisma.imperialPlayer.findFirst({
    where: {
      game: {
        id: gameId,
        userId
      }
    },
    select: {
      id: true,
      agendaDecks: {
        select: {
          agendas: true
        }
      },
      agendas: {
        select: {
          discarded: true,
          agenda: true
        }
      }
    }
  })

  if (!player || !data) {
    return {}
  }

  await prisma.imperialPlayer.update({
    where: {
      id: player.id
    },
    data: {
      agendas: {
        deleteMany: {
          agendaId: {
            in: player.agendas
              .map((a) => a.agenda.id)
              .filter((id) => !data.agendas.some((a) => a.id === id))
          }
        },
        upsert: data.agendas.map((agenda) => ({
          create: {
            agendaId: agenda.id,
            discarded: agenda.discarded
          },
          update: {
            discarded: agenda.discarded
          },
          where: {
            imperialId_agendaId: {
              agendaId: agenda.id,
              imperialId: player.id
            }
          }
        }))
      }
    }
  })

  return { success: Date.now() } satisfies ActionData
}
