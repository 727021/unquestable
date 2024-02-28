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
import {
  ChangeEvent,
  ElementRef,
  useEffect,
  useReducer,
  useRef,
  useState
} from 'react'
import { Side } from '@prisma/client'
import { withZod } from '@remix-validated-form/with-zod'
import { zfd } from 'zod-form-data'
import { z } from 'zod'
import { validationError, ValidatedForm } from 'remix-validated-form'
import TextInput from '~/components/TextInput'
import ButtonBar from '~/components/ButtonBar'
import { calculateRewards } from '~/utils/missionRewards'

const validator = withZod(
  zfd.formData({
    win: zfd.text(z.enum([Side.IMPERIAL, Side.REBEL]))
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
  // const data = useOutletContext<LoaderData>()
  const data = useLoaderData<typeof loader>()
  console.log(data)

  const [winner, setWinner] = useState<Side | null>(null)
  const [crates, setCrates] = useState(0)
  const [placeholderValues, setPlaceholderValue] = useReducer(
    (
      state: { [key: string]: any },
      action: ChangeEvent<ElementRef<'input'>>
    ) => ({
      ...state,
      [action.target.name]:
        action.target.type === 'number'
          ? action.target.valueAsNumber
          : action.target.value
    }),
    {}
  )

  const rewards = calculateRewards({
    ...data.mission,
    winner,
    crates,
    placeholderValues
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
            onChange={val => setWinner(val as Side)}
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
          {/* TODO: Reward placeholder inputs */}
          <button type="submit" className="btn">
            Resolve Mission
          </button>
        </ValidatedForm>
        <div className="flex-1 whitespace-nowrap">
          {/* TODO: Rewards preview */}
        </div>
      </div>
    </>
  )
}

export default Resolve
