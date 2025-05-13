import { redirect } from 'react-router'
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router'
import { prisma } from '~/services/db.server'
import { zfd } from 'zod-form-data'
import { z } from 'zod'
import { requireAuth } from '~/utils/requireAuth.server'
import { parseFormData } from '@rvf/react-router'

export type ActionData = { success?: number }

export const loader = async ({ params }: LoaderFunctionArgs) => {
  return redirect(`/games/${params.game}/empire`)
}

export const agendaSchema =
  zfd.formData({
    agendasToAdd: zfd.repeatable(
      z.array(zfd.numeric(z.number().int().positive()))
    ),
    agendasToDiscard: zfd.repeatable(
      z.array(zfd.numeric(z.number().int().positive()))
    ),
    agendasToRestore: zfd.repeatable(
      z.array(zfd.numeric(z.number().int().positive()))
    ),
    agendasToReshuffle: zfd.repeatable(
      z.array(zfd.numeric(z.number().int().positive()))
    )
  })


export const action = async (args: ActionFunctionArgs) => {
  const { data } = await parseFormData(await args.request.formData(), agendaSchema)

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
        create: [
          ...data.agendasToAdd.map((agendaId) => ({
            agenda: {
              connect: {
                id: agendaId
              }
            }
          })),
          ...data.agendasToDiscard
            .filter(
              (agendaId) =>
                !player.agendas.some((a) => a.agenda.id === agendaId)
            )
            .map((agendaId) => ({
              agenda: {
                connect: {
                  id: agendaId
                }
              },
              discarded: true
            }))
        ],
        update: [
          ...data.agendasToDiscard
            .filter((agendaId) =>
              player.agendas.some((a) => a.agenda.id === agendaId)
            )
            .map((agendaId) => ({
              where: {
                imperialId_agendaId: {
                  imperialId: player.id,
                  agendaId
                }
              },
              data: {
                discarded: true
              }
            })),
          ...data.agendasToRestore.map((agendaId) => ({
            where: {
              imperialId_agendaId: {
                imperialId: player.id,
                agendaId
              }
            },
            data: {
              discarded: false
            }
          }))
        ],
        deleteMany: {
          agendaId: {
            in: data.agendasToReshuffle
          }
        }
      }
    }
  })

  return { success: Date.now() } satisfies ActionData
}
