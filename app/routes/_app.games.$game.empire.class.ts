import type { ActionFunctionArgs, LoaderFunctionArgs } from '@vercel/remix'
import { json, redirect } from '@vercel/remix'
import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { getUser } from '~/services/auth.server'
import { prisma } from '~/services/db.server'

export type ActionData = { success?: number }

export const loader = async ({ params }: LoaderFunctionArgs) => {
  return redirect(`/games/${params.game}/empire`)
}

export const classValidator = withZod(
  zfd.formData({
    cardsToAdd: zfd.repeatable(
      z.array(zfd.numeric(z.number().int().positive()))
    ),
    cardsToRemove: zfd.repeatable(
      z.array(zfd.numeric(z.number().int().positive()))
    )
  })
)

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { data } = await classValidator.validate(await request.formData())

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
      classCards: {
        select: {
          id: true
        }
      }
    }
  })

  if (!player || !data) {
    return json({})
  }

  await prisma.imperialPlayer.update({
    where: { id: player.id },
    data: {
      classCards: {
        connect: data.cardsToAdd.map((id) => ({ id })),
        disconnect: data.cardsToRemove.map((id) => ({ id }))
      }
    }
  })

  return json<ActionData>({ success: Date.now() })
}
