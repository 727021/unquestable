import { parseFormData } from '@rvf/react-router'
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'
import { redirect } from 'react-router'
import { z } from 'zod'
import { prisma } from '~/services/db.server'
import { requireAuth } from '~/utils/requireAuth.server'

export type ActionData = { success?: number }

export const loader = async ({ params }: LoaderFunctionArgs) => {
  return redirect(`/games/${params.game}/empire`)
}

export const classSchema = z.object({
  id: z.coerce.number().int().positive(),
  cardsToAdd: z.array(z.coerce.number().int().positive()),
  cardsToRemove: z.array(z.coerce.number().int().positive())
})

export const action = async (args: ActionFunctionArgs) => {
  const { data } = await parseFormData(
    await args.request.formData(),
    classSchema
  )

  const { userId } = await requireAuth(args)
  const gameId = parseInt(args.params.game!, 10)

  if (!data) {
    return {}
  }

  const player = await prisma.rebelPlayer.findFirst({
    where: {
      game: {
        id: gameId,
        userId
      },
      id: data.id
    },
    select: {
      id: true,
      classCards: {
        select: {
          id: true
        }
      }
    }
  })

  if (!player) {
    return {}
  }

  await prisma.rebelPlayer.update({
    where: { id: player.id },
    data: {
      classCards: {
        connect: data.cardsToAdd.map((id) => ({ id })),
        disconnect: data.cardsToRemove.map((id) => ({ id }))
      }
    }
  })

  return { success: Date.now() } satisfies ActionData
}
