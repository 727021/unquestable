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

export const summarySchema = z.object({
  name: z
    .ostring()
    .optional()
    .default('')
    .transform((input) => input?.trim() || null),
  xp: z.optional(z.coerce.number().int().nonnegative()).optional().default(0),
  influence: z
    .optional(z.coerce.number().int().nonnegative())
    .optional()
    .default(0)
})

export const action = async (args: ActionFunctionArgs) => {
  const { data } = await parseFormData(
    await args.request.formData(),
    summarySchema
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

  return { success: Date.now() } satisfies ActionData
}
