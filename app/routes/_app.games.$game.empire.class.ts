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
  cards: z.array(z.coerce.number().int().positive()).default([])
})

export const action = async (args: ActionFunctionArgs) => {
  const { data } = await parseFormData(
    await args.request.formData(),
    classSchema
  )

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
      classCards: {
        select: {
          id: true
        }
      }
    }
  })

  if (!player || !data) {
    return {}
  }

  await prisma.imperialPlayer.update({
    where: { id: player.id },
    data: {
      classCards: {
        set: data.cards.map((id) => ({ id }))
      }
    }
  })

  return { success: Date.now() } satisfies ActionData
}
