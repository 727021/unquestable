import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { getUser } from '~/services/auth.server'
import { prisma } from '~/services/db.server'
import { zfd } from 'zod-form-data'
import { z } from 'zod'
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid'
import { withZod } from '@remix-validated-form/with-zod'
import type { FieldErrors } from 'remix-validated-form'
import { ValidatedForm, validationError } from 'remix-validated-form'
import TextInput from '~/components/TextInput'
import SelectInput from '~/components/SelectInput'
import SubmitButton from '~/components/SubmitButton'
import GrayMissionsInput from '~/components/GrayMissionsInput'
import { randomIndex } from '~/utils/randomIndex'

const validator = withZod(
  zfd.formData({
    gameName: zfd.text(z.string().trim().min(1)),
    campaign: zfd.numeric(z.number().int().positive()),
    rebels: zfd.repeatable(
      z
        .array(
          z.object({
            name: zfd.text(z.string().trim().optional()),
            hero: zfd.numeric(z.number().int().positive())
          })
        )
        .min(1)
        .max(4)
    ),
    greenMissions: zfd.repeatable(
      z
        .array(zfd.numeric(z.number().int().positive()))
        .length(4, 'Choose exactly 4 green side missions')
    ),
    grayMissions: zfd
      .text(z.literal('RANDOM'))
      .or(
        zfd.repeatable(
          z
            .array(zfd.numeric(z.number().int().positive()))
            .length(4, 'Choose exactly 4 gray side missions')
        )
      ),
    imperialName: zfd.text(z.string().trim().optional()),
    imperialClass: zfd.numeric(z.number().int().positive()),
    agendaDecks: zfd.repeatable(
      z
        .array(zfd.numeric(z.number().int().positive()))
        .length(6, 'Choose exactly 6 agenda decks')
    )
  })
)

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request)
  const expansions = await prisma.expansion.findMany({
    where: {
      OR: [
        {
          defaultOwned: true
        },
        {
          id: {
            in: user.collection?.map(({ id }) => id) ?? []
          }
        }
      ]
    },
    include: {
      campaigns: {
        include: {
          startingMission: true
        }
      },
      heroes: {
        include: {
          mission: true,
          class: {
            include: {
              cards: {
                where: {
                  cost: 0
                }
              }
            }
          }
        }
      },
      agendas: {
        include: {
          agendas: true
        }
      },
      missions: {
        where: {
          type: {
            in: ['GREEN', 'GRAY']
          }
        }
      },
      classes: {
        where: {
          side: 'IMPERIAL'
        },
        include: {
          cards: {
            where: {
              cost: 0
            }
          }
        }
      }
    }
  })

  const campaigns = expansions.map((expansion) => expansion.campaigns).flat()
  const heroes = expansions.map((expansion) => expansion.heroes).flat()
  const agendas = expansions.map((expansion) => expansion.agendas).flat()
  const sideMissions = expansions.map((expansion) => expansion.missions).flat()
  const imperialClasses = expansions
    .map((expansion) => expansion.classes)
    .flat()

  return json({
    campaigns,
    heroes,
    agendas,
    sideMissions,
    imperialClasses
  })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getUser(request)

  const { data, error } = await validator.validate(await request.formData())

  if (error) {
    return validationError(error)
  }

  const campaign = await prisma.campaign.findUnique({
    where: {
      id: data.campaign,
      expansion: {
        OR: [
          {
            defaultOwned: true
          },
          {
            id: {
              in: user.collection?.map(({ id }) => id) ?? []
            }
          }
        ]
      }
    },
    include: {
      missionSlots: {
        where: {
          index: 0
        }
      }
    }
  })

  if (!campaign) {
    return validationError({
      fieldErrors: {
        campaign: 'Invalid'
      }
    })
  }

  if (data.grayMissions === 'RANDOM') {
    const grayMissions = await prisma.mission.findMany({
      where: {
        type: 'GRAY',
        expansion: {
          OR: [
            {
              defaultOwned: true
            },
            {
              id: {
                in: user.collection?.map(({ id }) => id) ?? []
              }
            }
          ]
        },
        AND: [
          {
            OR: [
              {
                start: null
              },
              {
                start: {
                  lte: campaign.period
                }
              }
            ]
          },
          {
            OR: [
              {
                end: null
              },
              {
                end: {
                  gte: campaign.period
                }
              }
            ]
          }
        ]
      },
      select: {
        id: true
      }
    })

    data.grayMissions = new Array(4)
      .fill(0)
      .map(() => grayMissions.splice(randomIndex(grayMissions), 1)[0].id)
  }

  // validate heroes
  const heroes = await prisma.hero.findMany({
    where: {
      id: {
        in: data.rebels.map((r) => r.hero)
      }
    },
    select: {
      id: true,
      missionId: true
    }
  })

  if (heroes.length !== data.rebels.length) {
    const fieldErrors: FieldErrors = {}
    data.rebels.forEach((rebel, i) => {
      if (!heroes.some((h) => h.id === rebel.hero)) {
        fieldErrors[`rebels[${i}].hero`] = 'Invalid'
      }
    })
    return validationError({
      fieldErrors
    })
  }

  // validate side missions
  const sideMissions = await prisma.mission.findMany({
    where: {
      type: {
        in: ['GRAY', 'GREEN']
      },
      id: {
        in: [...data.grayMissions, ...data.greenMissions]
      },
      expansion: {
        OR: [
          {
            defaultOwned: true
          },
          {
            id: {
              in: user.collection?.map(({ id }) => id) ?? []
            }
          }
        ]
      },
      AND: [
        {
          OR: [
            {
              start: null
            },
            {
              start: {
                lte: campaign.period
              }
            }
          ]
        },
        {
          OR: [
            {
              end: null
            },
            {
              end: {
                gte: campaign.period
              }
            }
          ]
        }
      ]
    },
    select: {
      id: true,
      type: true
    }
  })

  let hasSideMissionErrors = false
  const sideMissionErrors: FieldErrors = {}
  if (sideMissions.filter((m) => m.type === 'GRAY').length !== 4) {
    sideMissionErrors.grayMissions = 'Choose exactly 4 gray side missions'
    hasSideMissionErrors = true
  }
  if (sideMissions.filter((m) => m.type === 'GREEN').length !== 4) {
    sideMissionErrors.greenMissions = 'Choose exactly 4 green side missions'
    hasSideMissionErrors = true
  }
  if (hasSideMissionErrors) {
    return validationError({
      fieldErrors: sideMissionErrors
    })
  }

  // validate imperial class
  const imperialClass = await prisma.class.findFirst({
    where: {
      id: data.imperialClass,
      expansion: {
        OR: [
          {
            defaultOwned: true
          },
          {
            id: {
              in: user.collection?.map(({ id }) => id) ?? []
            }
          }
        ]
      },
      side: 'IMPERIAL'
    },
    select: {
      id: true
    }
  })
  if (!imperialClass) {
    return validationError({
      fieldErrors: {
        imperialClass: 'Invalid'
      }
    })
  }

  // validate agenda decks
  const agendaDecks = await prisma.agendaDeck.findMany({
    where: {
      id: {
        in: data.agendaDecks
      },
      expansion: {
        OR: [
          {
            defaultOwned: true
          },
          {
            id: {
              in: user.collection?.map(({ id }) => id) ?? []
            }
          }
        ]
      }
    }
  })
  if (agendaDecks.length !== 6) {
    return validationError({
      fieldErrors: {
        agendaDecks: 'Choose exactly 6 agenda decks'
      }
    })
  }

  // create!
  const newGame = await prisma.game.create({
    data: {
      userId: user.id,
      name: data.gameName,
      rebelPlayers: {
        createMany: {
          data: data.rebels.map((rebel) => ({
            name: rebel.name,
            heroId: rebel.hero
          }))
        }
      },
      campaignId: data.campaign,
      missions: {
        // put starting mission into play
        create: {
          missionId: campaign.startId,
          missionSlotId: campaign.missionSlots[0].id
        }
      },
      imperialPlayer: {
        create: {
          name: data.imperialName,
          agendaDecks: {
            connect: data.agendaDecks.map((id) => ({ id }))
          },
          classId: data.imperialClass
        }
      },
      sideMissionDeck: {
        connect: [
          // red side missions
          ...heroes.map(({ missionId }) => ({ id: missionId })),
          // gray and green side missions
          ...sideMissions.map(({ id }) => ({ id }))
        ]
      }
    },
    select: {
      id: true,
      imperialPlayer: {
        select: {
          id: true,
          classId: true
        }
      },
      rebelPlayers: {
        select: {
          id: true,
          hero: {
            select: {
              class: {
                select: {
                  id: true
                }
              }
            }
          }
        }
      }
    }
  })

  const imperialCard = await prisma.classCard.findFirst({
    where: {
      cost: 0,
      decks: {
        some: {
          id: newGame.imperialPlayer?.classId
        }
      }
    },
    select: {
      id: true
    }
  })

  await prisma.classCard.update({
    data: {
      imperials: {
        connect: {
          id: newGame.imperialPlayer?.id
        }
      }
    },
    where: {
      id: imperialCard?.id
    }
  })

  const rebelCards = await prisma.classCard.findMany({
    where: {
      cost: 0,
      decks: {
        some: {
          id: {
            in: newGame.rebelPlayers.map(r => r.hero.class?.id ?? 0)
          }
        }
      }
    },
    select: {
      id: true,
      decks: {
        select: {
          hero: {
            select: {
              players: {
                select: {
                  id: true
                },
                where: {
                  id: {
                    in: newGame.rebelPlayers.map(r => r.id)
                  }
                }
              }
            }
          }
        }
      }
    }
  })

  await Promise.all(rebelCards.map(card => prisma.classCard.update({
    data: {
      rebels: {
        connect: {
          id: card.decks[0].hero?.players[0].id
        }
      }
    },
    where: {
      id: card.id
    }
  })))

  return redirect(`/games/${newGame.id}`)
}

const NewGame = () => {
  const { campaigns, heroes, sideMissions, imperialClasses, agendas } =
    useLoaderData<typeof loader>()

  const [gameName, setGameName] = useState('')
  const [campaign, setCampaign] = useState(-1)
  const [rebels, setRebels] = useState([-1])
  const [imperialClass, setImperialClass] = useState(-1)

  const campaignRef = useRef<HTMLSelectElement>(null)

  const addHero = () => {
    setRebels((prev) => {
      if (prev.length >= 4) {
        return prev
      }
      return [...prev, -1]
    })
  }
  const removeHero = () => {
    setRebels((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev))
  }

  const setAtIndex = (
    i: number,
    val: number,
    setter: Dispatch<SetStateAction<number[]>>
  ) =>
    setter((prev) => {
      if (!prev) prev = []
      prev[i] = val
      return [...prev]
    })

  const chosenCampaign = useMemo(() => {
    return campaigns.find((c) => c.id === campaign)
  }, [campaign, campaigns])

  const availableHeroes = useCallback(
    (i: number) => {
      return heroes.filter(
        (hero) => !rebels.includes(hero.id) || rebels[i] === hero.id
      )
    },
    [heroes, rebels]
  )

  const availableMissions = useMemo(() => {
    const green: typeof sideMissions = []
    const gray: typeof sideMissions = []
    if (chosenCampaign) {
      sideMissions.forEach((mission) => {
        if (
          chosenCampaign.period >= (mission.start || 0) &&
          chosenCampaign.period <= (mission.end || Infinity)
        ) {
          if (mission.type === 'GREEN') green.push(mission)
          if (mission.type === 'GRAY') gray.push(mission)
        }
      })
    }
    return { green, gray }
  }, [chosenCampaign, sideMissions])

  return (
    <div className="prose max-w-full">
      <h1 className="m-0">New Game</h1>
      <ValidatedForm
        validator={validator}
        method="POST"
        className="max-w-full p-3"
      >
        <h2 className="m-0">Campaign Info</h2>
        <div className="flex flex-row gap-x-2 flex-wrap">
          <TextInput
            name="gameName"
            label="Game Name"
            required
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
          />
          <SelectInput
            name="campaign"
            label="Campaign"
            onChange={(e) => setCampaign(parseInt(e.target.value, 10))}
            value={campaign}
            hintLeft={chosenCampaign?.startingMission.name}
            hintRight={chosenCampaign?.period}
            required
            ref={campaignRef}
          >
            <option disabled value={-1}>
              Choose a Campaign
            </option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectInput>
        </div>
        <div className="flex items-center my-4 gap-2">
          <h2 className="m-0">Rebel Players</h2>
          <button
            className="btn btn-square btn-sm btn-outline btn-neutral"
            type="button"
            disabled={rebels.length <= 1}
            onClick={removeHero}
          >
            <MinusIcon />
          </button>
          <button
            className="btn btn-square btn-sm btn-outline btn-neutral"
            type="button"
            disabled={rebels.length >= 4}
            onClick={addHero}
          >
            <PlusIcon />
          </button>
        </div>
        {rebels.map((rebel, i) => (
          <div key={i} className="flex gap-x-2 flex-wrap">
            <TextInput
              name={`rebels[${i}].name`}
              label={`Rebel ${i + 1} Name`}
            />
            <SelectInput
              name={`rebels[${i}].hero`}
              label={`Rebel ${i + 1} Hero`}
              onChange={(e) =>
                setAtIndex(i, parseInt(e.target.value, 10), setRebels)
              }
              value={rebels[i]}
              required
              hintLeft={heroes.find((h) => h.id === rebel)?.tagline}
              hintRight={
                heroes.find((h) => h.id === rebel)?.class?.cards?.[0]?.name
              }
            >
              <option disabled value={-1}>
                Choose a Hero
              </option>
              {availableHeroes(i).map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </SelectInput>
          </div>
        ))}
        <h2 className="m-0">Side Mission Deck</h2>
        {chosenCampaign ? (
          <div className="flex gap-x-2 flex-wrap">
            <SelectInput
              name="greenMissions"
              label="Green Side Missions"
              required
              multiple
            >
              {availableMissions.green.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </SelectInput>
            <GrayMissionsInput>
              {availableMissions.gray.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </GrayMissionsInput>
          </div>
        ) : (
          <button
            className="link link-hover"
            type="button"
            onClick={() => campaignRef.current?.focus()}
          >
            Choose a campaign
          </button>
        )}
        <h2 className="m-0">Imperial Player</h2>
        <div className="flex gap-x-2 flex-wrap">
          <div className="flex flex-col gap-x-2 max-w-full">
            <TextInput name="imperialName" label="Imperial Name" />
            <SelectInput
              name="imperialClass"
              label="Imperial Class"
              required
              value={imperialClass}
              onChange={(e) => setImperialClass(parseInt(e.target.value, 10))}
              hintRight={
                imperialClasses.find((c) => c.id === imperialClass)?.cards?.[0]
                  ?.name
              }
            >
              <option disabled value={-1}>
                Choose a Class
              </option>
              {imperialClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectInput>
          </div>
          <SelectInput
            name="agendaDecks"
            label="Agenda Decks"
            required
            multiple
          >
            {agendas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </SelectInput>
        </div>
        <SubmitButton>Start Game</SubmitButton>
      </ValidatedForm>
    </div>
  )
}

export default NewGame
