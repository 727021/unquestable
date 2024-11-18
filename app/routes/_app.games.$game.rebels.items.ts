import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { getUser } from '~/services/auth.server'
import { prisma } from '~/services/db.server'

export type ActionData = { success?: number }

export const loader = async ({ params }: LoaderFunctionArgs) => {
  return redirect(`/games/${params.game}/empire`)
}

export const itemValidator = withZod(
  zfd.formData({
    credits: zfd
      .numeric(z.optional(z.number().int().nonnegative()))
      .optional()
      .default(0),
    itemsToAdd: zfd.repeatable(
      z.array(zfd.numeric(z.number().int().positive()))
    ),
    itemsToRemove: zfd.repeatable(
      z.array(zfd.numeric(z.number().int().positive()))
    )
  })
)

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { data } = await itemValidator.validate(await request.formData())

  const user = await getUser(request)
  const gameId = parseInt(params.game!, 10)

  const game = await prisma.game.findFirst({
    where: {
      id: gameId,
      userId: user.id
    },
    select: {
      id: true
    }
  })

  if (!game || !data) {
    return json({})
  }

  await prisma.game.update({
    where: { id: game.id },
    data: {
      items: {
        connect: data.itemsToAdd.map((id) => ({ id })),
        disconnect: data.itemsToRemove.map((id) => ({ id }))
      },
      credits: data.credits
    }
  })

  return json<ActionData>({ success: Date.now() })
}
