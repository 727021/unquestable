import {
  json,
  redirect,
  useLoaderData,
  useOutletContext,
  useParams
} from '@remix-run/react'
import type { LoaderData } from './_app.games.$game'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { prisma } from '~/services/db.server'
import type { ChangeEvent, ElementRef } from 'react'
import { useReducer, useState } from 'react'
import { MissionRewardType, Side } from '@prisma/client'
import { withZod } from '@remix-validated-form/with-zod'
import { zfd } from 'zod-form-data'
import { z } from 'zod'
import { validationError, ValidatedForm } from 'remix-validated-form'
import TextInput from '~/components/TextInput'
import ButtonBar from '~/components/ButtonBar'
import { calculateRewards } from '~/utils/missionRewards'
import PlaceholderInput from '~/components/PlaceholderInput'

const validator = withZod(
  zfd.formData({
    win: zfd.text(z.enum([Side.IMPERIAL, Side.REBEL])),
    crates: zfd.numeric(z.number().int().nonnegative()),
    placeholders: zfd
      .repeatable(
        z.array(
          z.object({
            id: zfd.numeric(z.number().int().positive()),
            name: zfd.text(z.string().min(1)),
            value: zfd.text(z.string().min(1))
          })
        )
      )
      .optional()
  })
)

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const mission = await prisma.gameMission.findUnique({
    where: {
      id: parseInt(params.mission!, 10),
      resolved: false
    },
    select: {
      id: true,
      mission: {
        select: {
          rewardPlaceholders: {
            select: {
              id: true,
              label: true,
              name: true,
              validation: true,
              status: true,
              type: true
            }
          },
          rewards: {
            select: {
              type: true,
              side: true,
              condition: true,
              credits: true,
              id: true,
              influence: true,
              multiplier: true,
              reward: {
                select: {
                  id: true,
                  name: true,
                  tagline: true
                }
              },
              xp: true,
              troop: {
                select: {
                  id: true,
                  name: true,
                  traits: true
                }
              },
              forcedMission: {
                select: {
                  id: true,
                  name: true
                }
              },
              nextMission: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          name: true,
          hero: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  })

  if (!mission) {
    return redirect(`/games/${params.game}`)
  }

  return json(mission)
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { data, error } = await validator.validate(await request.formData())

  if (error) {
    return validationError(error)
  }

  // TODO: resolve mission and grant rewards
  return json({})
}

const Resolve = () => {
  const params = useParams()
  const ctx = useOutletContext<LoaderData>()
  const data = useLoaderData<typeof loader>()

  const [winner, setWinner] = useState<Side | null>(null)
  const [crates, setCrates] = useState(0)
  const [placeholderValues, setPlaceholderValue] = useReducer(
    (
      state: { [key: string]: any },
      action: {
        name: string
        type: string
        event: ChangeEvent<ElementRef<'input'>>
      }
    ) => ({
      ...state,
      [action.name]:
        action.type === 'number'
          ? action.event.target.valueAsNumber
          : action.type === 'boolean'
            ? action.event.target.checked
            : action.event.target.value
    }),
    {}
  )

  const placeholders = data.mission.rewardPlaceholders.filter(
    (p) =>
      p.type === MissionRewardType.ALL ||
      (!!winner &&
        (winner === Side.REBEL
          ? MissionRewardType.WIN
          : MissionRewardType.LOSS))
  )

  const rewards = calculateRewards({
    ...data.mission,
    winner,
    crates,
    placeholderValues,
    rebels: ctx.game.rebelPlayers
  })

  return (
    <>
      <h2 className="m-0">
        Resolving <em>{data.mission.name}</em>
      </h2>
      <div className="flex w-full flex-wrap max-w-full">
        <ValidatedForm
          validator={validator}
          method="POST"
          className="flex-1 whitespace-nowrap"
        >
          <ButtonBar
            name="win"
            label="Winner"
            required
            onChange={(val) => setWinner(val as Side)}
            options={[
              {
                label: 'Rebels',
                value: Side.REBEL
              },
              {
                label: 'Empire',
                value: Side.IMPERIAL
              }
            ]}
          />
          <TextInput
            name="crates"
            label="Crates Collected"
            type="number"
            min="0"
            step="1"
            value={crates}
            onChange={(e) => setCrates(e.target.valueAsNumber)}
            required
          />
          {placeholders.map((placeholder, i) => (
            <PlaceholderInput
              key={placeholder.id}
              index={i}
              placeholder={placeholder}
              onChange={(event) => {
                setPlaceholderValue({
                  event,
                  name: placeholder.name,
                  type: placeholder.type
                })
              }}
            />
          ))}
          <button type="submit" className="btn">
            Resolve Mission
          </button>
        </ValidatedForm>
        <div className="flex flex-col gap-2 flex-1 whitespace-nowrap">
          {!!winner && (
            <>
              <div className="w-full">
                <div className="flex gap-5 items-baseline">
                  <h2 className="m-0">Empire</h2>
                  {ctx.game.imperialPlayer?.name && (
                    <span>({ctx.game.imperialPlayer.name})</span>
                  )}
                </div>
                <p className="m-0">XP: {rewards.imperialXp}</p>
                <p className="m-0">Influence: {rewards.influence}</p>
                {rewards.villain && (
                  <p className="m-0">Villain: {rewards.villain.name}</p>
                )}
                {rewards.imperialReward && (
                  <p className="m-0">Reward: {rewards.imperialReward.name}</p>
                )}
              </div>
              <div className="w-full">
                <h2 className="m-0">Rebels</h2>
                <table className="table table-sm m-0">
                  <thead>
                    <tr>
                      <th>Hero</th>
                      <th>XP</th>
                      {data.mission.hero && rewards.rebelReward && (
                        <th>Reward</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {ctx.game.rebelPlayers.map((rebel) => (
                      <tr key={rebel.id}>
                        <td className="flex gap-5 items-baseline">
                          <p className="m-0">{rebel.hero.name}</p>
                          {rebel.name && <span>({rebel.name})</span>}
                        </td>
                        <td>{rewards.rebelXp}</td>
                        {data.mission.hero && rewards.rebelReward && (
                          <td>
                            {data.mission.hero.id === rebel.hero.id &&
                              rewards.rebelReward.name}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="m-0">Credits: {rewards.credits}</p>
                {rewards.ally && (
                  <p className="m-0">Ally: {rewards.ally.name}</p>
                )}
                {rewards.rebelReward && !data.mission.hero && (
                  <p className="m-0">Reward: {rewards.rebelReward.name}</p>
                )}
              </div>
              {rewards.nextMission && (
                <p className="m-0">Mission: {rewards.nextMission.name}</p>
              )}
              {rewards.forcedMission && (
                <p className="m-0">
                  Forced Mission: {rewards.forcedMission.name}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default Resolve
