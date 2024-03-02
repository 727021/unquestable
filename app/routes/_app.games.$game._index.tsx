import { Link, json, useOutletContext, useParams } from '@remix-run/react'
import clsx from 'clsx'
import type { LoaderData } from './_app.games.$game'
import { MissionSlotType, MissionType } from '@prisma/client'
import { useState } from 'react'
import Modal from '~/components/Modal'
import { ValidatedForm, validationError } from 'remix-validated-form'
import SubmitButton from '~/components/SubmitButton'
import { zfd } from 'zod-form-data'
import { z } from 'zod'
import { withZod } from '@remix-validated-form/with-zod'
import SelectInput from '~/components/SelectInput'
import type { ActionFunctionArgs } from '@remix-run/node'
import { getUser } from '~/services/auth.server'
import SideMissionsInput from '~/components/SideMissionsInput'

const drawValidator = withZod(
  zfd.formData({
    missions: zfd
      .text(z.literal('RANDOM'))
      .or(
        zfd.repeatable(
          z.array(zfd.numeric(z.number().int().positive())).min(1).max(2)
        )
      )
  })
)
const chooseValidator = withZod(zfd.formData({}))

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getUser(request)

  const formData = await request.formData()

  const action = formData.get('action')?.toString()

  if (action === 'draw') {
    const { data, error } = await drawValidator.validate(formData)

    if (error) {
      return validationError(error)
    }

    // determine how many missions need to be chosen

    // validate missions

    // add chosen missions to game

    // return json data
  } else {
    const { data, error } = await chooseValidator.validate(formData)

    if (error) {
      return validationError(error)
    }

    // validate chosen mission

    // add game mission to campaing mission slot

    // redirect to current page to reload data and close modal
  }

  return json({})
}

const Game = () => {
  const params = useParams()
  const data = useOutletContext<LoaderData>()

  const [choosing, setChoosing] = useState<number | null>(null)

  const activeSideMissions = data.game.missions.filter(
    (m) =>
      !m.forced &&
      !m.resolved &&
      (m.mission.type === MissionType.GRAY ||
        m.mission.type === MissionType.GREEN ||
        m.mission.type === MissionType.RED)
  )

  const availableSideMissions = data.game.sideMissionDeck

  // Forced missions are resolved BETWEEN campaign stages. They do not get their own buy stages.
  // If there is an active forced mission, the players cannot resolve another mission or buy stage.
  const hasActiveForcedMission = data.game.missions.some(m => m.forced && !m.resolved)

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        <div className="flex flex-col flex-1">
          <h2 className="m-0">Campaign Log</h2>
          <table className="table m-0">
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
                      !arr[i - 1]?.gameMissions?.[0]?.imperialBuyComplete
                      ? 'bg-base-300'
                      : 'hover'
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
                          arr[i - 1]?.gameMissions?.[0]?.imperialBuyComplete) &&
                        !data.game.missions.some(
                          (m) => m.forced && !m.resolved
                        ) && (
                          <>
                            <button
                              type="button"
                              className="btn btn-sm"
                              onClick={() => setChoosing(slot.id)}
                              disabled={hasActiveForcedMission}
                            >
                              Choose Mission
                            </button>
                            <Modal
                              open={choosing !== null}
                              onClose={() => setChoosing(null)}
                            >
                              {activeSideMissions.length < 2 ? (
                                <>
                                  <h2 className="m-0">Draw Side Missions</h2>
                                  <ValidatedForm
                                    validator={drawValidator}
                                    method="POST"
                                  >
                                    <input
                                      type="hidden"
                                      name="action"
                                      value="draw"
                                    />
                                    <SideMissionsInput
                                      name="missions"
                                      count={2 - activeSideMissions.length}
                                    >
                                      {availableSideMissions.map((mission) => (
                                        <option
                                          key={mission.id}
                                          value={mission.id}
                                        >
                                          {mission.name}
                                        </option>
                                      ))}
                                    </SideMissionsInput>
                                    <div className="flex gap-2">
                                      <SubmitButton>
                                        Choose Mission
                                      </SubmitButton>
                                      <button
                                        type="button"
                                        className="btn"
                                        onClick={() => setChoosing(null)}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </ValidatedForm>
                                </>
                              ) : (
                                <>
                                  <h2 className="m-0">Choose Side Mission</h2>
                                  <ValidatedForm
                                    validator={chooseValidator}
                                    method="POST"
                                  >
                                    <input
                                      type="hidden"
                                      name="action"
                                      value="choose"
                                    />
                                    <SelectInput
                                      name="mission"
                                      label="Mission"
                                      required
                                    >
                                      <option selected disabled></option>
                                      {activeSideMissions.map((m) => (
                                        <option key={m.id} value={m.id}>
                                          {m.mission.name}
                                        </option>
                                      ))}
                                    </SelectInput>
                                    <div className="flex gap-2">
                                      <SubmitButton>Start Mission</SubmitButton>
                                      <button
                                        type="button"
                                        className="btn"
                                        onClick={() => setChoosing(null)}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </ValidatedForm>
                                </>
                              )}
                            </Modal>
                          </>
                        )}
                    </td>
                  )}
                  <td className="text-center">{slot.threat}</td>
                  {slot.gameMissions[0] &&
                  (i === 0 ||
                    (arr[i - 1]?.gameMissions?.[0]?.imperialBuyComplete &&
                      !data.game.missions.some(
                        (m) => m.forced && !m.imperialBuyComplete
                      ))) ? (
                    slot.gameMissions[0].imperialBuyComplete ? (
                      <td className="text-center">
                        {slot.gameMissions[0].winner === 'IMPERIAL'
                          ? 'Empire'
                          : 'Rebels'}
                      </td>
                    ) : (
                      <td className="text-center">
                        {slot.gameMissions[0].rebelBuyComplete ? (
                          // Might separate rebel and imperial buy stages later.
                          // For now, they are on the same page.
                          <Link
                            to={`/games/${params.game}/resolve/${slot.gameMissions[0].id}/buy`}
                            className={clsx('btn btn-sm btn-primary', hasActiveForcedMission && 'disabled')}
                            onClick={e => hasActiveForcedMission && e.preventDefault()}
                            aria-disabled={hasActiveForcedMission}
                          >
                            Buy
                          </Link>
                        ) : slot.gameMissions[0].resolved ? (
                          <Link
                            to={`/games/${params.game}/resolve/${slot.gameMissions[0].id}/buy`}
                            className={clsx('btn btn-sm btn-primary', hasActiveForcedMission && 'disabled')}
                            onClick={e => hasActiveForcedMission && e.preventDefault()}
                            aria-disabled={hasActiveForcedMission}
                          >
                            Buy
                          </Link>
                        ) : (
                          <Link
                            to={`/games/${params.game}/resolve/${slot.gameMissions[0].id}`}
                            className={clsx('btn btn-sm btn-primary', hasActiveForcedMission && 'disabled')}
                            onClick={e => hasActiveForcedMission && e.preventDefault()}
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
          {/* TODO: Display forced missions */}
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <Link
            to={`/games/${params.game}/empire`}
            className="w-full no-underline"
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
            className="w-full no-underline"
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
        </div>
      </div>
    </>
  )
}

export default Game
