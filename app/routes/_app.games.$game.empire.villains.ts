import { json, redirect } from '@vercel/remix'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@vercel/remix'
import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { prisma } from '~/services/db.server'
import { requireAuth } from '~/utils/requireAuth.server'

export type ActionData = { success?: number }

export const loader = async ({ params }: LoaderFunctionArgs) => {
  return redirect(`/games/${params.game}/empire`)
}

export const villainValidator = withZod(
  zfd.formData({
    villainsToAdd: zfd.repeatable(
      z.array(zfd.numeric(z.number().int().positive()))
    ),
    villainsToRemove: zfd.repeatable(
      z.array(zfd.numeric(z.number().int().positive()))
    )
  })
)

export const action = async (args: ActionFunctionArgs) => {
  const { data } = await villainValidator.validate(
    await args.request.formData()
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
    return json({})
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

  return json<ActionData>({ success: Date.now() })
}
