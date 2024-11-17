import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { getUser } from '~/services/auth.server'
import { prisma } from '~/services/db.server'

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

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { data } = await summaryValidator.validate(await request.formData())

  if (!data) {
    return json({})
  }

  const user = await getUser(request)
  const gameId = parseInt(params.game!, 10)

  const player = await prisma.rebelPlayer.findFirst({
    where: {
      game: {
        id: gameId,
        userId: user.id
      },
      id: data.id
    },
    select: {
      id: true
    }
  })

  if (!player) {
    return json({})
  }

  await prisma.rebelPlayer.update({
    where: { id: player.id },
    data: {
      name: data.name,
      xp: data.xp
    }
  })

  return json<ActionData>({ success: Date.now() })
}
