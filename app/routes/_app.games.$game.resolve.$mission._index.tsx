import {
  json,
  redirect,
  useLoaderData,
  useOutletContext
} from '@remix-run/react'
import type { LoaderData } from './_app.games.$game'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { prisma } from '~/services/db.server'
import type { ChangeEvent, ElementRef } from 'react'
import { useEffect, useReducer, useState } from 'react'
import { MissionRewardType, MissionType, Side } from '@prisma/client'
import { withZod } from '@remix-validated-form/with-zod'
import { zfd } from 'zod-form-data'
import { z } from 'zod'
import type { FieldErrors } from 'remix-validated-form'
import { validationError, ValidatedForm } from 'remix-validated-form'
import TextInput from '~/components/TextInput'
import ButtonBar from '~/components/ButtonBar'
import { calculateRewards } from '~/utils/missionRewards'
import PlaceholderInput from '~/components/PlaceholderInput'
import { getUser } from '~/services/auth.server'
import SubmitButton from '~/components/SubmitButton'
import SelectInput from '~/components/SelectInput'

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
      .optional(),
    rewardedRebel: zfd.numeric(z.number().int().positive()).optional()
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
      forced: true,
      mission: {
        select: {
          id: true,
          type: true,
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
  const user = await getUser(request)

  const { data, error } = await validator.validate(await request.formData())

  if (error) {
    return validationError(error)
  }

  if (!params.game) {
    return redirect('/games')
  }
  const gameId = parseInt(params.game, 10)
  if (isNaN(gameId)) {
    return redirect('/games')
  }

  const game = await prisma.game.findUnique({
    where: {
      id: gameId,
      userId: user.id
    },
    select: {
      missions: {
        select: {
          id: true,
          forced: true,
          resolved: true,
          winner: true,
          mission: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        },
        where: {
          missionSlot: null
        }
      },
      rebelPlayers: {
        select: {
          id: true,
          name: true,
          xp: true,
          classCards: {
            select: {
              id: true,
              name: true,
              cost: true
            }
          },
          hero: {
            select: {
              name: true,
              id: true,
              class: {
                select: {
                  cards: {
                    select: {
                      id: true,
                      name: true,
                      cost: true
                    }
                  }
                }
              }
            }
          },
          rewards: {
            select: {
              id: true,
              name: true
            }
          }
        }
      },
      campaign: {
        select: {
          missionSlots: {
            select: {
              id: true,
              index: true,
              type: true,
              gameMissions: {
                where: {
                  gameId
                },
                take: 1
              }
            },
            orderBy: {
              index: 'asc'
            }
          }
        }
      }
    }
  })

  if (!game) {
    return redirect('/games')
  }

  const mission = await prisma.gameMission.findUnique({
    where: {
      id: parseInt(params.mission!, 10),
      resolved: false
    },
    select: {
      id: true,
      threat: true,
      forced: true,
      mission: {
        select: {
          id: true,
          type: true,
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

  // parse placeholder values
  const placeholderValues = data.placeholders?.reduce<{
    [key: string]: any
    errors: FieldErrors
  }>(
    (acc, p, i) => {
      const placeholder = mission.mission.rewardPlaceholders.find(
        (pl) => pl.id === p.id
      )

      if (!placeholder) return acc

      // convert value to correct type
      const value =
        placeholder.type === 'number'
          ? parseInt(p.value, 10)
          : placeholder.type === 'boolean'
            ? p.value === 'true'
            : p.value

      const name = p.name

      // validate placeholder values
      if (
        placeholder.validation &&
        typeof placeholder.validation === 'object' &&
        !Array.isArray(placeholder.validation)
      ) {
        if (
          typeof placeholder.validation.min === 'number' &&
          typeof value === 'number' &&
          value < placeholder.validation.min
        ) {
          acc.errors[`placeholders[${i}].value`] =
            `Must be at least ${placeholder.validation.min}`
        } else if (
          typeof placeholder.validation.max === 'number' &&
          typeof value === 'number' &&
          value > placeholder.validation.max
        ) {
          acc.errors[`placeholders[${i}].value`] =
            `Must be at most ${placeholder.validation.max}`
        } else if (
          typeof placeholder.validation.step === 'number' &&
          typeof value === 'number' &&
          value % placeholder.validation.step !== 0
        ) {
          acc.errors[`placeholders[${i}].value`] =
            `Must be a multiple of ${placeholder.validation.step}`
        }
      }

      acc[name] = value

      return acc
    },
    { errors: {} }
  )

  // validate placeholder values
  if (
    placeholderValues?.errors &&
    Object.keys(placeholderValues.errors).length
  ) {
    return validationError({
      fieldErrors: placeholderValues.errors
    })
  }

  const {
    credits,
    rebelXp,
    ally,
    rebelReward,
    imperialXp,
    influence,
    villain,
    imperialReward,
    forcedMission,
    nextMission
  } = calculateRewards({
    ...mission.mission,
    placeholderValues,
    rebels: game.rebelPlayers,
    winner: data.win,
    crates: data.crates
  })

  const foundNextMission = nextMission
    ? await prisma.mission.findUnique({
        where: {
          id: nextMission.id
        }
      })
    : null
  const nextStorySlot = nextMission
    ? game.campaign.missionSlots.find(
        (slot) =>
          slot.type === MissionType.STORY && slot.gameMissions.length === 0
      )
    : null

  // If an agenda mission (IMPERIAL side mission) is in play and the rebels choose
  // to resolve a different side mission, give the imperial player the rewards from
  // that agenda mission
  const skippedMission =
    !mission.forced &&
    (mission.mission.type === MissionType.GRAY ||
      mission.mission.type === MissionType.GREEN ||
      mission.mission.type === MissionType.RED)
      ? game.missions.find(
          (m) =>
            !m.resolved && !m.forced && m.mission.type === MissionType.IMPERIAL
        )
      : null
  const skippedMissionReward = await prisma.missionReward.findFirst({
    where: {
      missionId: skippedMission?.id ?? 0,
      type: MissionRewardType.LOSS
    },
    select: {
      troopId: true,
      rewardId: true
    }
  })

  const imperialRewardId = imperialReward?.id ?? skippedMissionReward?.rewardId
  const villainId = villain?.id ?? skippedMissionReward?.troopId

  await prisma.game.update({
    where: {
      id: gameId
    },
    data: {
      credits: {
        increment: credits
      },
      ...(ally
        ? {
            allies: {
              connect: {
                id: ally?.id
              }
            }
          }
        : {}),
      ...(forcedMission || nextMission
        ? {
            missions: {
              createMany: {
                data: [
                  ...(forcedMission
                    ? [
                        {
                          missionId: forcedMission.id,
                          forced: true,
                          threat: mission.threat
                        }
                      ]
                    : []),
                  ...(nextMission
                    ? [
                        {
                          missionId: nextMission.id,
                          missionSlotId:
                            foundNextMission?.type === MissionType.STORY
                              ? nextStorySlot?.id
                              : null
                        }
                      ]
                    : [])
                ]
              },
              update: [
                {
                  where: {
                    id: parseInt(params.mission!, 10)
                  },
                  data: {
                    resolved: true,
                    winner: data.win
                  }
                },
                ...(skippedMission ? [
                  {
                    where: {
                      id: skippedMission.id
                    },
                    data: {
                      resolved: true,
                      rebelBuyComplete: true,
                      imperialBuyComplete: true
                    }
                  }
                ] : [])
              ]
            }
          }
        : {}),
      imperialPlayer: {
        update: {
          xp: {
            increment: imperialXp
          },
          influence: {
            increment: influence
          },
          ...(villainId
            ? {
                villains: {
                  connect: {
                    id: villainId
                  }
                }
              }
            : {}),
          ...(imperialRewardId
            ? {
                rewards: {
                  connect: {
                    id: imperialRewardId
                  }
                }
              }
            : {})
        }
      },
      rebelPlayers: {
        updateMany: [
          {
            where: {
              gameId
            },
            data: {
              xp: {
                increment: rebelXp
              }
            }
          }
        ],
        ...(rebelReward
          ? {
              update: {
                where: {
                  id:
                    game.rebelPlayers.find(
                      (r) => r.hero.id === mission.mission.hero?.id
                    )?.id ??
                    data.rewardedRebel ??
                    0
                },
                data: {
                  rewards: {
                    connect: {
                      id: rebelReward?.id ?? 0
                    }
                  }
                }
              }
            }
          : {})
      }
    }
  })

  return redirect(`/games/${gameId}/resolve/${params.mission}/buy`)
}

const Resolve = () => {
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
  const [chosenHero, setChosenHero] = useState(-1)

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

  useEffect(() => {
    if (!rewards.rebelReward || data.mission.hero) {
      setChosenHero(-1)
    }
  }, [data.mission.hero, rewards.rebelReward])

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
          {rewards.rebelReward && !data.mission.hero && (
            <SelectInput
              name="rewardedRebel"
              label={
                <>
                  Hero to Recieve <em>{rewards.rebelReward.name}</em>
                </>
              }
              required
              value={chosenHero}
              onChange={(e) => setChosenHero(parseInt(e.target.value, 10))}
            >
              <option value={-1} disabled>
                Choose a Hero
              </option>
              {ctx.game.rebelPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.hero.name}
                  {p.name && ` (${p.name})`}
                </option>
              ))}
            </SelectInput>
          )}
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
          <SubmitButton>Resolve Mission</SubmitButton>
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
                      {rewards.rebelReward && <th>Reward</th>}
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
                        {rewards.rebelReward && (
                          <td>
                            {(data.mission.hero?.id === rebel.hero.id ||
                              chosenHero === rebel.id) &&
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