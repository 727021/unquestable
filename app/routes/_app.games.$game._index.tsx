import { Link, redirect, useOutletContext, useParams } from 'react-router'
import clsx from 'clsx'
import type { LoaderData } from './_app.games.$game'
import {
  MissionSlotType,
  MissionStage,
  MissionType,
  Side
} from '@prisma/client'
import { useId, useState } from 'react'
import Modal from '~/components/Modal'
import { parseFormData, useForm, validationError } from '@rvf/react-router'
import SubmitButton from '~/components/SubmitButton'
import { z } from 'zod'
import SelectInput from '~/components/SelectInput'
import type { ActionFunctionArgs } from 'react-router'
import { prisma } from '~/services/db.server'

const schema = z.object({
  mission: z.coerce.number().int().positive('Required'),
  slot: z.coerce.number().int().positive()
})

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const game = await prisma.game.findUnique({
    where: {
      id: parseInt(params.game!, 10)
    },
    select: {
      id: true,
      sideMissionDeck: {
        where: {
          gameMissions: {
            none: {
              gameId: parseInt(params.game!, 10)
            }
          }
        }
      },
      missions: {
        include: {
          mission: true
        }
      },
      campaign: {
        select: {
          missionSlots: true
        }
      }
    }
  })

  if (!game) {
    return redirect('/games')
  }

  const { data, error } = await parseFormData(await request.formData(), schema)

  if (error) {
    return validationError(error)
  }

  // validate chosen mission and campaign mission slot
  const gameMission = game.missions.find(
    (m) =>
      m.id === data.mission &&
      !m.forced &&
      !m.stage &&
      !m.missionSlotId &&
      (m.mission.type === MissionType.GRAY ||
        m.mission.type === MissionType.GREEN ||
        m.mission.type === MissionType.RED)
  )
  if (!gameMission) {
    return validationError({
      fieldErrors: {
        mission: 'Required'
      }
    })
  }
  const slot = game.campaign.missionSlots.find(
    (s) =>
      s.id === data.slot &&
      s.type === MissionSlotType.SIDE &&
      !game.missions.some((m) => m.missionSlotId === s.id)
  )
  if (!slot) {
    // Something went wrong, reload the page to close the mission modal
    return redirect(`/games/${params.game}`)
  }

  // add game mission to campaing mission slot
  await prisma.gameMission.update({
    where: {
      id: gameMission.id
    },
    data: {
      missionSlotId: slot.id,
      threat: slot.threat
    }
  })

  // redirect to current page to reload data and close modal
  return redirect(`/games/${params.game}`)
}

const Game = () => {
  const params = useParams()
  const data = useOutletContext<LoaderData>()

  const activeSideMissions = data.game.missions.filter(
    (m) => !m.forced && !m.stage && m.mission.type !== MissionType.STORY
  )

  // Forced missions are resolved BETWEEN campaign stages. They do not get their own buy stages.
  // If there is an active forced mission, the players cannot resolve another mission or buy stage.
  const forcedMissions = data.game.missions
    .filter((m) => m.forced)
    .toSorted((a, b) => +!!b.stage - +!!a.stage)
  const hasActiveForcedMission = forcedMissions.some((m) => !m.stage)

  const formId = useId()
  const form = useForm({
    id: formId,
    schema,
    method: 'POST',
    defaultValues: {
      slot: -1,
      mission: -1
    }
  })

  const [choosing, setChoosing] = useState(false)
  const openChoosing = (slotId: number) => {
    form.setValue('slot', slotId)
    setChoosing(true)
  }
  const closeChoosing = () => {
    form.resetForm()
    setChoosing(false)
  }

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        <div className="flex flex-col flex-1">
          <h2 className="m-0">Campaign Log</h2>
          <table className="table m-0 not-prose">
            <thead>
              <tr>
                <td></td>
                <td>Mission</td>
                <td className="text-center">Threat Level</td>
                <td className="text-center">Result</td>
              </tr>
            </thead>
            <tbody>
              {data.game.campaign.missionSlots.map((slot, i, arr) => (
                <tr
                  key={slot.index}
                  className={clsx(
                    i !== 0 &&
                      arr[i - 1]?.gameMissions?.[0]?.stage !==
                        MissionStage.RESOLVED
                      ? 'bg-base-300'
                      : 'hover:bg-base-200'
                  )}
                >
                  <td>
                    {i === 0
                      ? 'Introduction'
                      : i === arr.length - 1
                        ? 'Finale'
                        : slot.type === 'SIDE'
                          ? 'Side Mission'
                          : 'Story Mission'}
                  </td>
                  {slot.gameMissions[0] ? (
                    <td>{slot.gameMissions[0].mission.name}</td>
                  ) : (
                    <td>
                      {slot.type === MissionSlotType.SIDE &&
                        (i === 0 ||
                          arr[i - 1]?.gameMissions?.[0]?.stage ===
                            MissionStage.RESOLVED) &&
                        !data.game.missions.some(
                          (m) => m.forced && !m.stage
                        ) && (
                          <>
                            <button
                              type="button"
                              className="btn btn-sm"
                              onClick={() => openChoosing(slot.id)}
                              disabled={hasActiveForcedMission}
                            >
                              Choose Mission
                            </button>
                            <Modal
                              open={choosing}
                              onClose={() => closeChoosing()}
                            >
                              <h2 className="m-0">Choose Side Mission</h2>
                              <form {...form.getFormProps()}>
                                {form.renderFormIdInput()}
                                <input {...form.getHiddenInputProps('slot')} />
                                <SelectInput
                                  formApi={form}
                                  name="mission"
                                  label="Mission"
                                  required
                                >
                                  <option value={-1}></option>
                                  {activeSideMissions.map((m) => (
                                    <option key={m.id} value={m.id}>
                                      {m.mission.name}
                                      {m.mission.type ===
                                        MissionType.IMPERIAL &&
                                        ' (IMPERIAL AGENDA)'}
                                    </option>
                                  ))}
                                </SelectInput>
                                <div className="flex gap-2">
                                  <SubmitButton formApi={form}>
                                    Start Mission
                                  </SubmitButton>
                                  <button
                                    type="button"
                                    className="btn"
                                    onClick={() => closeChoosing()}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            </Modal>
                          </>
                        )}
                    </td>
                  )}
                  <td className="text-center">{slot.threat}</td>
                  {slot.gameMissions[0] &&
                  (i === 0 ||
                    arr[i - 1]?.gameMissions?.[0]?.stage ===
                      MissionStage.RESOLVED) ? (
                    slot.gameMissions[0].stage === MissionStage.RESOLVED ? (
                      <td className="text-center">
                        {slot.gameMissions[0].winner === Side.IMPERIAL
                          ? 'Empire'
                          : 'Rebels'}
                      </td>
                    ) : (
                      <td className="text-center">
                        {slot.gameMissions[0].stage ===
                        MissionStage.CHOOSE_MISSION ? (
                          <Link
                            to={`/games/${params.game}/resolve/${slot.gameMissions[0].id}/draw`}
                            className={clsx(
                              'btn btn-sm btn-primary',
                              hasActiveForcedMission && 'btn-disabled'
                            )}
                            onClick={(e) =>
                              hasActiveForcedMission && e.preventDefault()
                            }
                            aria-disabled={hasActiveForcedMission}
                          >
                            Draw
                          </Link>
                        ) : slot.gameMissions[0].stage ===
                          MissionStage.REBEL_BUY ? (
                          <Link
                            to={`/games/${params.game}/resolve/${slot.gameMissions[0].id}/buy/rebel`}
                            className={clsx(
                              'btn btn-sm btn-primary',
                              hasActiveForcedMission && 'btn-disabled'
                            )}
                            onClick={(e) =>
                              hasActiveForcedMission && e.preventDefault()
                            }
                            aria-disabled={hasActiveForcedMission}
                          >
                            Rebel Buy
                          </Link>
                        ) : slot.gameMissions[0].stage ===
                          MissionStage.IMPERIAL_BUY ? (
                          <Link
                            to={`/games/${params.game}/resolve/${slot.gameMissions[0].id}/buy/imperial`}
                            className={clsx(
                              'btn btn-sm btn-primary',
                              hasActiveForcedMission && 'btn-disabled'
                            )}
                            onClick={(e) =>
                              hasActiveForcedMission && e.preventDefault()
                            }
                            aria-disabled={hasActiveForcedMission}
                          >
                            Imperial Buy
                          </Link>
                        ) : (
                          <Link
                            to={`/games/${params.game}/resolve/${slot.gameMissions[0].id}`}
                            className={clsx(
                              'btn btn-sm btn-primary',
                              hasActiveForcedMission && 'btn-disabled'
                            )}
                            onClick={(e) =>
                              hasActiveForcedMission && e.preventDefault()
                            }
                            aria-disabled={hasActiveForcedMission}
                          >
                            Resolve
                          </Link>
                        )}
                      </td>
                    )
                  ) : (
                    <td></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {!!forcedMissions.length && (
            <>
              <div className="divider mb-0">Forced Missions</div>
              <table className="table m-0">
                <thead>
                  <tr>
                    <td>Mission</td>
                    <td className="text-center">Threat Level</td>
                    <td className="text-center">Result</td>
                  </tr>
                </thead>
                <tbody>
                  {forcedMissions.map((m) => (
                    <tr key={m.id} className="hover:bg-base-200">
                      <td>{m.mission.name}</td>
                      <td className="text-center">{m.threat}</td>
                      <td className="text-center">
                        {m.stage === MissionStage.RESOLVED ? (
                          m.winner === Side.IMPERIAL ? (
                            'Empire'
                          ) : (
                            'Rebels'
                          )
                        ) : (
                          <Link
                            to={`/games/${params.game}/resolve/${m.id}`}
                            className="btn btn-sm btn-primary"
                          >
                            Resolve
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <Link
            to={`/games/${params.game}/empire`}
            className="w-full no-underline border rounded-xs p-2"
          >
            <div className="flex gap-5 items-baseline">
              <h2 className="m-0">Empire</h2>
              {data.game.imperialPlayer?.name && (
                <span>({data.game.imperialPlayer.name})</span>
              )}
            </div>
            <p className="m-0">Class: {data.game.imperialPlayer?.class.name}</p>
            <p className="m-0">XP: {data.game.imperialPlayer?.xp}</p>
            <p className="m-0">
              Influence: {data.game.imperialPlayer?.influence}
            </p>
          </Link>
          <Link
            to={`/games/${params.game}/rebels`}
            className="w-full no-underline border rounded-xs p-2"
          >
            <h2 className="m-0">Rebels</h2>
            <p className="m-0">Credits: {data.game.credits}</p>
            <table className="table table-sm m-0">
              <thead>
                <tr>
                  <th>Hero</th>
                  <th>XP</th>
                </tr>
              </thead>
              <tbody>
                {data.game.rebelPlayers.map((rebel) => (
                  <tr key={rebel.id}>
                    <td className="flex gap-5 items-baseline">
                      <p className="m-0">{rebel.hero.name}</p>
                      {rebel.name && <span>({rebel.name})</span>}
                    </td>
                    <td>{rebel.xp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Link>
          <div className="flex flex-col px-2">
            <Link
              to={`/games/${params.game}/missions`}
              className="no-underline hover:underline"
            >
              Side Mission Deck
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default Game
