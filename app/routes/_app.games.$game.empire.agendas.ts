import { json, redirect } from '@remix-run/node';
import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import { prisma } from '~/services/db.server'
import { getUser } from '~/services/auth.server'
import { withZod } from '@remix-validated-form/with-zod'
import { zfd } from 'zod-form-data'
import { z } from 'zod'

export type ActionData = { success?: number }

export const loader = async ({ params }: LoaderFunctionArgs) => {
  return redirect(`/games/${params.game}/empire`);
};

export const agendaValidator = withZod(
  zfd.formData({
    agendasToAdd: zfd.repeatable(
      z.array(zfd.numeric(z.number().int().positive()))
    ),
    agendasToDiscard: zfd.repeatable(
      z.array(zfd.numeric(z.number().int().positive()))
    ),
    agendasToRestore: zfd.repeatable(
      z.array(zfd.numeric(z.number().int().positive()))
    ),
    agendasToReshuffle: zfd.repeatable(
      z.array(zfd.numeric(z.number().int().positive()))
    ),
    form: z.literal('agenda')
  })
)

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { data } = await agendaValidator.validate(await request.formData())

  console.log(data)

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
      agendaDecks: {
        select: {
          agendas: true
        }
      },
      agendas: {
        select: {
          discarded: true,
          agenda: true
        }
      }
    }
  })

  if (!player) {
    return json({})
  }

  // Save changes to db (create, update, delete ownedAgenda)

  // add

  // discard (may not be owned)

  // restore

  // reshuffle

  return json<ActionData>({ success: Date.now() })
}
