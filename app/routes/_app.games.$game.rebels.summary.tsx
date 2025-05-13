import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'
import { redirect } from 'react-router'
import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { prisma } from '~/services/db.server'
import { requireAuth } from '~/utils/requireAuth.server'

export type ActionData = { success?: number }

export const loader = async ({ params }: LoaderFunctionArgs) => {
  return redirect(`/games/${params.game}/rebels`)
}

export const summaryValidator = withZod(
  zfd.formData({
    id: zfd.numeric(z.number().int().positive()),
    name: zfd
      .text(z.ostring())
      .optional()
      .default('')
      .transform((input) => input?.trim() || null),
    xp: zfd
      .numeric(z.optional(z.number().int().nonnegative()))
      .optional()
      .default(0)
  })
)

export const action = async (args: ActionFunctionArgs) => {
  const { data } = await summaryValidator.validate(
    await args.request.formData()
  )

  if (!data) {
    return {}
  }

  const { userId } = await requireAuth(args)
  const gameId = parseInt(args.params.game!, 10)

  const player = await prisma.rebelPlayer.findFirst({
    where: {
      game: {
        id: gameId,
        userId
      },
      id: data.id
    },
    select: {
      id: true
    }
  })

  if (!player) {
    return {}
  }

  await prisma.rebelPlayer.update({
    where: { id: player.id },
    data: {
      name: data.name,
      xp: data.xp
    }
  })

  return { success: Date.now() } satisfies ActionData
}
