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
import { ValidatedForm, validationError } from 'remix-validated-form'
import TextInput from '~/components/TextInput'
import SelectInput from '~/components/SelectInput'
import SubmitButton from '~/components/SubmitButton'
import ChooseGrayMissions from '~/components/ChooseGrayMissions'

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
          mission: true
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

const validator = withZod(
  zfd.formData({
    gameName: zfd.text(z.string().min(1)),
    campaign: zfd.numeric(z.number().int().positive()),
    rebels: zfd.repeatable(
      z
        .array(
          z.object({
            name: zfd.text(z.string().optional()),
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
      // .text(z.string().regex(/^RANDOM$/, 'Choose exactly 4 gray side missions'))
      .text(z.literal('RANDOM'))
      .or(
        zfd.repeatable(
          z
            .array(zfd.numeric(z.number().int().positive()))
            .length(4, 'Choose exactly 4 gray side missions')
        )
      )
  })
)

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getUser(request)

  const result = await validator.validate(await request.formData())

  if (result.error) {
    return validationError(result.error)
  }

  console.log(result.data)

  // TODO: redirect to new game
  return json({})
}

const NewGame = () => {
  const { campaigns, heroes, sideMissions } = useLoaderData<typeof loader>()

  const [gameName, setGameName] = useState('')
  const [campaign, setCampaign] = useState(-1)
  const [rebels, setRebels] = useState([-1])

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
    <div className="prose">
      <h1 className="prose-h1">New Game</h1>
      <ValidatedForm validator={validator} method="POST">
        <h2 className="m-0">Campaign Info</h2>
        <div className="flex flex-row gap-3">
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
          <div key={i} className="flex flex-row gap-3">
            <TextInput
              name={`rebels[${i}].name`}
              label={`Rebel ${i + 1} Name`}
            />
            <SelectInput
              name={`rebels[${i}].hero`}
              label={`Rebel ${i + 1} Hero`}
              // onChange={e => setHero(i, parseInt(e.target.value, 10))}
              onChange={(e) =>
                setAtIndex(i, parseInt(e.target.value, 10), setRebels)
              }
              value={rebels[i]}
              required
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
          <div className="flex gap-2">
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
            <ChooseGrayMissions>
              {availableMissions.gray.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </ChooseGrayMissions>
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
        <SubmitButton>Start Game</SubmitButton>
      </ValidatedForm>
    </div>
  )
}

export default NewGame
