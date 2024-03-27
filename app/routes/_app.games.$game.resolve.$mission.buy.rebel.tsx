import { MissionStage } from '@prisma/client'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { useLoaderData, useOutletContext } from '@remix-run/react'
import { prisma } from '~/services/db.server'
import type { LoaderData as GameLoaderData } from './_app.games.$game'
import { ValidatedForm, validationError } from 'remix-validated-form'
import { withZod } from '@remix-validated-form/with-zod'
import { zfd } from 'zod-form-data'
import BuyClassCard from '~/components/BuyClassCard'
import { Fragment } from 'react'
import SubmitButton from '~/components/SubmitButton'
import { z } from 'zod'
import BuyItemCard from '~/components/BuyItemCard'
import { getUser } from '~/services/auth.server'
import { getSellPrice } from '~/utils/sellPrice'

const validator = withZod(
  zfd.formData({
    rebels: zfd.repeatable(
      z.array(
        z.object({
          id: zfd.numeric(z.number().positive()),
          cards: zfd.repeatable(z.array(zfd.numeric(z.number().positive())))
        })
      )
    ),
    items: z
      .object({
        bought: zfd
          .repeatableOfType(zfd.numeric(z.number().positive()))
          .optional()
          .default([]),
        sold: zfd
          .repeatableOfType(zfd.numeric(z.number().positive()))
          .optional()
          .default([])
      })
      .optional()
      .default({})
  })
)

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const user = await getUser(request)

  const forcedMission = await prisma.gameMission.findFirst({
    where: {
      gameId: parseInt(params.game!, 10),
      stage: {
        equals: undefined
      },
      forced: true
    },
    select: {
      id: true
    }
  })

  if (forcedMission) {
    return redirect(`/games/${params.game}`)
  }

  const mission = await prisma.gameMission.findUnique({
    where: {
      id: parseInt(params.mission!, 10),
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
    return redirect(`/games/${params.game}`)
  }

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
          id: parseInt(params.game!, 10)
        }
      }
    }
  })

  return json({ mission, items })
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { data, error } = await validator.validate(await request.formData())

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

  return redirect(`/games/${params.game}/resolve/${params.mission}/buy/imperial`)
}

const BuyStage = () => {
  const data = useLoaderData<typeof loader>()
  const ctx = useOutletContext<GameLoaderData>()

  return (
    <>
      <h2 className="m-0">
        Rebel Buy for <em>{data.mission.mission.name}</em>
      </h2>
      <ValidatedForm
        validator={validator}
        method="POST"
        className="flex flex-col gap-3 w-fit"
      >
        <div className="flex flex-wrap gap-3">
          {ctx.game.rebelPlayers.map((rebel, i) => (
            <Fragment key={rebel.id}>
              <BuyClassCard
                xp={rebel.xp}
                cards={rebel.hero.class!.cards}
                label={rebel.hero.name}
                name={`rebels[${i}].cards`}
                owned={rebel.classCards}
              />
              <input type="hidden" name={`rebels[${i}].id`} value={rebel.id} />
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
        />
        <SubmitButton>Buy</SubmitButton>
      </ValidatedForm>
    </>
  )
}

export default BuyStage
