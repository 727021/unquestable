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

export const itemSchema = z.object({
  credits: z
    .optional(z.coerce.number().int().nonnegative())
    .optional()
    .default(0),
  itemsToAdd: z.array(z.coerce.number().int().positive()),
  itemsToRemove: z.array(z.coerce.number().int().positive())
})

export const action = async (args: ActionFunctionArgs) => {
  const { data } = await parseFormData(
    await args.request.formData(),
    itemSchema
  )

  const { userId } = await requireAuth(args)
  const gameId = parseInt(args.params.game!, 10)

  const game = await prisma.game.findFirst({
    where: {
      id: gameId,
      userId
    },
    select: {
      id: true
    }
  })

  if (!game || !data) {
    return {}
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

  return { success: Date.now() } satisfies ActionData
}
