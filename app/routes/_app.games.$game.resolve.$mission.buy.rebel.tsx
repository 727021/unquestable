import { MissionStage } from '@prisma/client'
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'
import { redirect } from 'react-router'
import { useLoaderData, useOutletContext } from 'react-router'
import { prisma } from '~/services/db.server'
import type { LoaderData as GameLoaderData } from './_app.games.$game'
import { parseFormData, useForm, validationError } from '@rvf/react-router'
import BuyClassCard from '~/components/BuyClassCard'
import { Fragment, useId } from 'react'
import SubmitButton from '~/components/SubmitButton'
import { z } from 'zod'
import BuyItemCard from '~/components/BuyItemCard'
import { getSellPrice } from '~/utils/sellPrice'
import { requireAuth } from '~/utils/requireAuth.server'

const schema = z.object({
  rebels: z.array(
    z.object({
      id: z.coerce.number().positive(),
      cards: z.array(z.coerce.number().positive()).optional().default([])
    })
  ),
  items: z
    .object({
      bought: z.array(z.coerce.number().positive()).optional().default([]),
      sold: z.array(z.coerce.number().positive()).optional().default([])
    })
    .optional()
    .default({ bought: [], sold: [] })
})

export const loader = async (args: LoaderFunctionArgs) => {
  const { userId } = await requireAuth(args)

  const forcedMission = await prisma.gameMission.findFirst({
    where: {
      gameId: parseInt(args.params.game!, 10),
      stage: {
        equals: null
      },
      forced: true
    }
  })

  if (forcedMission) {
    return redirect(`/games/${args.params.game}`)
  }

  const mission = await prisma.gameMission.findUnique({
    where: {
      id: parseInt(args.params.mission!, 10),
      stage: MissionStage.REBEL_BUY,
      // Forced missions don't get their own buy stage
      forced: false
    },
    select: {
      id: true,
      mission: {
        select: {
          id: true,
          type: true,
          name: true
        }
      },
      missionSlot: {
        select: {
          itemTiers: true
        }
      }
    }
  })

  if (!mission) {
    return redirect(`/games/${args.params.game}`)
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId
    },
    include: {
      collection: {
        select: {
          id: true
        }
      }
    }
  })
  const items = await prisma.item.findMany({
    where: {
      tier: {
        in: mission.missionSlot?.itemTiers ?? []
      },
      OR: [
        {
          expansionId: {
            in: user.collection.map(({ id }) => id)
          }
        },
        {
          expansion: {
            defaultOwned: true
          }
        }
      ],
      games: {
        none: {
          id: parseInt(args.params.game!, 10)
        }
      }
    }
  })

  return { mission, items }
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { data, error } = await parseFormData(await request.formData(), schema)

  if (error) {
    return validationError(error)
  }

  const boughtItems = await prisma.item.findMany({
    where: {
      id: {
        in: data.items.bought
      }
    }
  })

  const soldItems = await prisma.item.findMany({
    where: {
      id: {
        in: data.items.sold
      }
    }
  })

  const classCardCosts = await Promise.all(
    data.rebels.map((r) =>
      prisma.classCard
        .aggregate({
          _sum: {
            cost: true
          },
          where: {
            id: {
              in: r.cards
            }
          }
        })
        .then((res) => res._sum.cost ?? 0)
    )
  )

  // TODO: Validate players can afford items and class cards

  await prisma.gameMission.update({
    where: {
      id: parseInt(params.mission!, 10)
    },
    data: {
      stage: MissionStage.IMPERIAL_BUY,
      game: {
        update: {
          credits: {
            decrement:
              boughtItems.reduce((acc, cur) => acc + cur.cost, 0) -
              soldItems.reduce((acc, cur) => acc + getSellPrice(cur.cost), 0)
          },
          items: {
            connect: boughtItems.map((b) => ({ id: b.id })),
            disconnect: soldItems.map((s) => ({ id: s.id }))
          },
          rebelPlayers: {
            update: data.rebels.map((r, i) => ({
              where: {
                id: r.id
              },
              data: {
                classCards: {
                  connect: r.cards.map((id) => ({ id }))
                },
                xp: {
                  decrement: classCardCosts[i]
                }
              }
            }))
          }
        }
      }
    }
  })

  return redirect(
    `/games/${params.game}/resolve/${params.mission}/buy/imperial`
  )
}

const BuyStage = () => {
  const data = useLoaderData<typeof loader>()
  const ctx = useOutletContext<GameLoaderData>()

  const formId = useId()
  const form = useForm({
    submitSource: 'state',
    id: formId,
    schema,
    method: 'POST',
    defaultValues: {
      rebels: ctx.game.rebelPlayers.map((rebel) => ({
        id: rebel.id,
        cards: []
      })),
      items: {
        bought: [],
        sold: []
      }
    }
  })

  return (
    <>
      <h2 className="m-0">
        Rebel Buy for <em>{data.mission.mission.name}</em>
      </h2>
      <form {...form.getFormProps()} className="flex flex-col gap-3 w-fit">
        {form.renderFormIdInput()}
        <div className="flex flex-wrap gap-3">
          {ctx.game.rebelPlayers.map((rebel, i) => (
            <Fragment key={rebel.id}>
              <BuyClassCard
                formApi={form}
                xp={rebel.xp}
                cards={rebel.hero.class!.cards}
                label={rebel.hero.name}
                name={`rebels[${i}].cards`}
                owned={rebel.classCards}
              />
              <input {...form.getHiddenInputProps(`rebels[${i}].id`)} />
            </Fragment>
          ))}
        </div>
        <BuyItemCard
          nameBought="items.bought"
          nameSold="items.sold"
          label="Item Cards"
          credits={ctx.game.credits}
          owned={ctx.game.items}
          cards={data.items}
          formApi={form}
        />
        <SubmitButton formApi={form} className="w-fit">
          Buy
        </SubmitButton>
      </form>
    </>
  )
}

export default BuyStage
