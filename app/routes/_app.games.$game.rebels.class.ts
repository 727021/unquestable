import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { prisma } from '~/services/db.server'
import { requireAuth } from '~/utils/requireAuth.server'

export type ActionData = { success?: number }

export const loader = async ({ params }: LoaderFunctionArgs) => {
  return redirect(`/games/${params.game}/empire`)
}

export const classValidator = withZod(
  zfd.formData({
    id: zfd.numeric(z.number().int().positive()),
    cardsToAdd: zfd.repeatable(
      z.array(zfd.numeric(z.number().int().positive()))
    ),
    cardsToRemove: zfd.repeatable(
      z.array(zfd.numeric(z.number().int().positive()))
    )
  })
)

export const action = async (args: ActionFunctionArgs) => {
  const { data } = await classValidator.validate(await args.request.formData())

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

  return json<ActionData>({ success: Date.now() })
}
