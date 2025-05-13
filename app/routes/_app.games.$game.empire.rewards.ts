import type { ActionFunctionArgs, LoaderFunctionArgs } from '@vercel/remix'
import { json, redirect } from '@vercel/remix'
import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { prisma } from '~/services/db.server'
import { requireAuth } from '~/utils/requireAuth.server'

export type ActionData = { success?: number }

export const loader = async ({ params }: LoaderFunctionArgs) => {
  return redirect(`/games/${params.game}/empire`)
}

export const rewardValidator = withZod(
  zfd.formData({
    rewardsToAdd: zfd.repeatable(
      z.array(zfd.numeric(z.number().int().positive()))
    ),
    rewardsToRemove: zfd.repeatable(
      z.array(zfd.numeric(z.number().int().positive()))
    )
  })
)

export const action = async (args: ActionFunctionArgs) => {
  const { data } = await rewardValidator.validate(await args.request.formData())

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
      rewards: {
        connect: data.rewardsToAdd.map((id) => ({ id })),
        disconnect: data.rewardsToRemove.map((id) => ({ id }))
      }
    }
  })

  return json<ActionData>({ success: Date.now() })
}
