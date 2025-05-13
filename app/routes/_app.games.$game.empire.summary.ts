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

export const summaryValidator = withZod(
  zfd.formData({
    name: zfd
      .text(z.ostring())
      .optional()
      .default('')
      .transform((input) => input?.trim() || null),
    xp: zfd
      .numeric(z.optional(z.number().int().nonnegative()))
      .optional()
      .default(0),
    influence: zfd
      .numeric(z.optional(z.number().int().nonnegative()))
      .optional()
      .default(0)
  })
)

export const action = async (args: ActionFunctionArgs) => {
  const { data } = await summaryValidator.validate(
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
    return {}
  }

  await prisma.imperialPlayer.update({
    where: { id: player.id },
    data: {
      name: data.name,
      xp: data.xp,
      influence: data.influence
    }
  })

  return json<ActionData>({ success: Date.now() })
}
