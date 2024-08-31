import { json, redirect } from '@remix-run/node'
import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node'
import { prisma } from '~/services/db.server'
import { getUser } from '~/services/auth.server'
import { withZod } from '@remix-validated-form/with-zod'
import { zfd } from 'zod-form-data'
import { z } from 'zod'

export type ActionData = { success?: number }

export const loader = async ({ params }: LoaderFunctionArgs) => {
  return redirect(`/games/${params.game}/empire`)
}

export const agendaValidator = withZod(
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
)

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { data } = await agendaValidator.validate(await request.formData())

  const user = await getUser(request)
  const gameId = parseInt(params.game!, 10)

  const player = await prisma.imperialPlayer.findFirst({
    where: {
      game: {
        id: gameId,
        userId: user.id
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
    return json({})
  }

  // Save changes to db (create, update, delete ownedAgenda)

  // add
  await prisma.imperialPlayer.update({
    where: {
      id: player.id
    },
    data: {
      agendas: {
        create: data.agendasToAdd.map((agendaId) => ({
          agenda: {
            connect: {
              id: agendaId
            }
          }
        }))
      }
    }
  })

  // discard (may not be owned)
  await prisma.imperialPlayer.update({
    where: {
      id: player.id
    },
    data: {
      agendas: {
        // create for previously unowned agendas
        create: data.agendasToDiscard
          .filter(
            (agendaId) => !player.agendas.some((a) => a.agenda.id === agendaId)
          )
          .map((agendaId) => ({
            agenda: {
              connect: {
                id: agendaId
              }
            },
            discarded: true
          })),
        // update for previously owned agendas
        update: data.agendasToDiscard
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
          }))
      }
    }
  })

  // restore
  await prisma.imperialPlayer.update({
    where: {
      id: player.id
    },
    data: {
      agendas: {
        update: data.agendasToRestore.map((agendaId) => ({
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
      }
    }
  })

  // reshuffle
  await prisma.imperialPlayer.update({
    where: {
      id: player.id
    },
    data: {
      agendas: {
        deleteMany: {
          agendaId: {
            in: data.agendasToReshuffle
          }
        }
      }
    }
  })

  return json<ActionData>({ success: Date.now() })
}
