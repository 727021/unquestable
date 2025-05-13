import { parseFormData } from '@rvf/react-router'
import { redirect } from 'react-router'
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { prisma } from '~/services/db.server'
import { requireAuth } from '~/utils/requireAuth.server'

export type ActionData = { success?: number }

export const loader = async ({ params }: LoaderFunctionArgs) => {
  return redirect(`/games/${params.game}/empire`)
}

export const villainSchema =
  zfd.formData({
    villainsToAdd: zfd.repeatable(
      z.array(zfd.numeric(z.number().int().positive()))
    ),
    villainsToRemove: zfd.repeatable(
      z.array(zfd.numeric(z.number().int().positive()))
    )
  })


export const action = async (args: ActionFunctionArgs) => {
  const { data } = await parseFormData(
    await args.request.formData(), villainSchema
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
      id: true
    }
  })

  if (!player || !data) {
    return {}
  }

  await prisma.imperialPlayer.update({
    where: { id: player.id },
    data: {
      villains: {
        connect: data.villainsToAdd.map((id) => ({ id })),
        disconnect: data.villainsToRemove.map((id) => ({ id }))
      }
    }
  })

  return { success: Date.now() } satisfies ActionData
}
