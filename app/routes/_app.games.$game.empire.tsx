import type { Reducer } from 'react'
import { useEffect, useReducer } from 'react'
import clsx from 'clsx'
import { useActionData, useOutletContext } from '@remix-run/react'
import type { LoaderData } from './_app.games.$game'
import EditButton from '~/components/EditButton'
import { withZod } from '@remix-validated-form/with-zod'
import { zfd } from 'zod-form-data'
import { z } from 'zod'
import { ValidatedForm } from 'remix-validated-form'
import SubmitButton from '~/components/SubmitButton'
import { PlusIcon } from '@heroicons/react/24/solid'
import {
  ArrowDownCircleIcon,
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon
} from '@heroicons/react/24/outline'
import type { ActionFunctionArgs} from '@remix-run/node';
import { json } from '@remix-run/node'
import { prisma } from '~/services/db.server'
import { getUser } from '~/services/auth.server'

// TODO: Pull all the agenda management out into a component?

type AgendaId = NonNullable<
  LoaderData['game']['imperialPlayer']
>['agendas'][0]['agenda']['id']

type State = {
  editing: boolean
}

type AgendaState = State & {
  agendasToAdd: AgendaId[]
  agendasToDiscard: AgendaId[]
  agendasToRestore: AgendaId[]
  agendasToReshuffle: AgendaId[]
  chosenAgenda: AgendaId
}

type Action = { type: 'TOGGLE_EDITING' }

type AgendaAction =
  | Action
  | {
      type:
        | 'ADD_AGENDA'
        | 'DISCARD_AGENDA'
        | 'RESTORE_AGENDA'
        | 'RESHUFFLE_AGENDA'
        | 'CHOOSE_AGENDA'
      agenda: AgendaId
    }

const agendaValidator = withZod(
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

type ActionData = { success?: number }
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const {
    data
  } = await agendaValidator.validate(await request.formData())

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

  // Figure out what actually needs to change

  // Save changes to db (create, update, delete ownedAgenda)

  return json<ActionData>({ success: Date.now() })
}

const initialAgendaState: AgendaState = {
  editing: false,
  agendasToAdd: [],
  agendasToDiscard: [],
  agendasToRestore: [],
  agendasToReshuffle: [],
  chosenAgenda: -1
}

const agendaReducer: Reducer<AgendaState, AgendaAction> = (state, action) => {
  switch (action.type) {
    case 'ADD_AGENDA': // unowned -> owned
      return {
        ...state,
        agendasToAdd: [...state.agendasToAdd, action.agenda],
        chosenAgenda: initialAgendaState.chosenAgenda
      }
    case 'DISCARD_AGENDA': // owned -> discarded
      return {
        ...state,
        agendasToDiscard: [...state.agendasToDiscard, action.agenda],
        agendasToAdd: state.agendasToAdd.filter(
          (agenda) => agenda !== action.agenda
        )
      }
    case 'RESTORE_AGENDA': // discarded -> owned
      return {
        ...state,
        agendasToAdd: [...state.agendasToAdd, action.agenda],
        agendasToDiscard: state.agendasToDiscard.filter(
          (agenda) => agenda !== action.agenda
        )
      }
    case 'RESHUFFLE_AGENDA': // owned|discarded -> unowned
      return {
        ...state,
        agendasToReshuffle: [...state.agendasToReshuffle, action.agenda],
        agendasToAdd: state.agendasToAdd.filter(
          (agenda) => agenda !== action.agenda
        ),
        agendasToDiscard: state.agendasToDiscard.filter(
          (agenda) => agenda !== action.agenda
        )
      }
    case 'CHOOSE_AGENDA':
      return {
        ...state,
        chosenAgenda: action.agenda
      }
    case 'TOGGLE_EDITING':
      return { ...initialAgendaState, editing: !state.editing }
  }
}

const Empire = () => {
  const data = useOutletContext<LoaderData>()
  const imperialPlayer = data.game.imperialPlayer!

  const actionData = useActionData<ActionData>()

  const [agendaState, changeAgenda] = useReducer(
    agendaReducer,
    initialAgendaState
  )

  useEffect(() => {
    if (actionData?.success) {
      // Exit edit mode after data is refreshed if the last submission was successful
      changeAgenda({ type: 'TOGGLE_EDITING' })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const allAgendas = imperialPlayer.agendaDecks
    .map((deck) => deck.agendas)
    .flat()

  const ownedAgendas = allAgendas
    .filter(
      (agenda) =>
        (imperialPlayer.agendas.some(
          (a) => a.agendaId === agenda.id && !a.discarded
        ) &&
          !agendaState.agendasToDiscard.includes(agenda.id) &&
          !agendaState.agendasToReshuffle.includes(agenda.id)) ||
        agendaState.agendasToAdd.includes(agenda.id) ||
        agendaState.agendasToRestore.includes(agenda.id)
    )
    .sort((a, b) => a.cost - b.cost)
  const discardedAgendas = allAgendas
    .filter(
      (agenda) =>
        (imperialPlayer.agendas.some(
          (a) => a.agendaId === agenda.id && a.discarded
        ) &&
          !agendaState.agendasToReshuffle.includes(agenda.id) &&
          !agendaState.agendasToRestore.includes(agenda.id)) ||
        agendaState.agendasToDiscard.includes(agenda.id)
    )
    .sort((a, b) => a.cost - b.cost)
  const unownedAgendas = allAgendas
    .filter(
      (agenda) =>
        !ownedAgendas.some((a) => a.id === agenda.id) &&
        !discardedAgendas.some((a) => a.id === agenda.id)
    )
    .sort((a, b) => a.cost - b.cost)

  return (
    <>
      <div className="flex flex-col flex-1 gap-2">
        <div className="flex gap-3 items-baseline">
          <h2 className="m-0">Empire</h2>
        </div>
        <div className="flex flex-1 px-2 pb-1 gap-2 border border-gray-400 rounded justify-between">
          <div>
            <span className="font-bold">Name:</span> {imperialPlayer.name}
          </div>
          <div>
            <span className="font-bold">XP:</span> {imperialPlayer.xp}
          </div>
          <div>
            <span className="font-bold">Influence:</span>{' '}
            {imperialPlayer.influence}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-col flex-1 px-2 pb-1 border border-gray-400 rounded">
            <h2 className="m-0">{imperialPlayer.class.name}</h2>
            <div className="form-control items-start w-fit py-2">
              {imperialPlayer.class.cards.map((card) => (
                <label
                  key={card.id}
                  className="label cursor-default gap-2 flex py-1"
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm cursor-default"
                    checked={imperialPlayer.classCards.some(
                      (c) => c.id === card.id
                    )}
                    readOnly
                  />
                  <span className="label-text">
                    {card.cost} XP - {card.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col flex-1 px-2 pb-1 border rounded border-gray-400">
            <div className="flex justify-between items-center w-full">
              <h2 className="m-0">Agendas</h2>
              <span className="flex gap-2 items-center">
                {agendaState.editing && (
                  <p className="m-0 text-primary">Editing</p>
                )}
                <EditButton
                  active={agendaState.editing}
                  onClick={() => changeAgenda({ type: 'TOGGLE_EDITING' })}
                />
              </span>
            </div>
            {agendaState.editing ? (
              <ValidatedForm
                validator={agendaValidator}
                method="POST"
                className="flex flex-col flex-1"
              >
                <div className="flex flex-wrap">
                  <div className="flex flex-col flex-1">
                    <h3 className="m-0">Owned</h3>
                    {!ownedAgendas.length && <p className="m-0">No Agendas</p>}
                    {ownedAgendas.map((agenda) => (
                      <div key={agenda.id} className="flex gap-1 items-center">
                        <p className="m-0">
                          {agenda.cost} - {agenda.name}
                        </p>
                        <button
                          className="btn btn-xs btn-circle btn-ghost tooltip"
                          data-tip="Reshuffle"
                          type="button"
                          onClick={() =>
                            changeAgenda({
                              type: 'RESHUFFLE_AGENDA',
                              agenda: agenda.id
                            })
                          }
                        >
                          <ArrowDownCircleIcon className="w-5 h-5" />
                        </button>
                        <button
                          className="btn btn-xs btn-circle btn-ghost tooltip"
                          data-tip="Discard"
                          type="button"
                          onClick={() =>
                            changeAgenda({
                              type: 'DISCARD_AGENDA',
                              agenda: agenda.id
                            })
                          }
                        >
                          <ArrowRightCircleIcon className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col flex-1">
                    <h3 className="m-0">Discarded</h3>
                    {!discardedAgendas.length && (
                      <p className="m-0">No Agendas</p>
                    )}
                    {discardedAgendas.map((agenda) => (
                      <div key={agenda.id} className="flex gap-1 items-center">
                        <p className="m-0">
                          {agenda.cost} - {agenda.name}
                        </p>
                        <button
                          className="btn btn-xs btn-circle btn-ghost tooltip"
                          data-tip="Restore"
                          type="button"
                          onClick={() =>
                            changeAgenda({
                              type: 'RESTORE_AGENDA',
                              agenda: agenda.id
                            })
                          }
                        >
                          <ArrowLeftCircleIcon className="w-5 h-5" />
                        </button>
                        <button
                          className="btn btn-xs btn-circle btn-ghost tooltip"
                          data-tip="Reshuffle"
                          type="button"
                          onClick={() =>
                            changeAgenda({
                              type: 'RESHUFFLE_AGENDA',
                              agenda: agenda.id
                            })
                          }
                        >
                          <ArrowDownCircleIcon className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-1 items-end justify-between">
                  <div className="flex flex-col gap-2">
                    <h3 className="m-0">Agenda Decks</h3>
                    <div className="join">
                      <select
                        className="join-item select select-bordered"
                        value={agendaState.chosenAgenda}
                        onChange={(e) =>
                          changeAgenda({
                            type: 'CHOOSE_AGENDA',
                            agenda: parseInt(e.target.value, 10)
                          })
                        }
                      >
                        <option value={-1} disabled>
                          Choose an Agenda
                        </option>
                        {unownedAgendas.map((agenda) => (
                          <option key={agenda.id} value={agenda.id}>
                            {agenda.cost} - {agenda.name}
                          </option>
                        ))}
                      </select>
                      <button
                        className="btn join-item btn-outline"
                        type="button"
                        onClick={() =>
                          agendaState.chosenAgenda > -1 &&
                          changeAgenda({
                            type: 'ADD_AGENDA',
                            agenda: agendaState.chosenAgenda
                          })
                        }
                        disabled={agendaState.chosenAgenda === -1}
                      >
                        <PlusIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <SubmitButton className="btn btn-primary btn-outline">
                    Save
                  </SubmitButton>
                </div>
                <input type="hidden" name="form" value="agenda" />
                {agendaState.agendasToAdd.map((agenda, i) => (
                  <input
                    key={`agendasToAdd-${agenda}`}
                    type="hidden"
                    name={`agendasToAdd[${i}]`}
                    value={agenda}
                  />
                ))}
                {agendaState.agendasToDiscard.map((agenda, i) => (
                  <input
                    key={`agendasToDiscard-${agenda}`}
                    type="hidden"
                    name={`agendasToDiscard[${i}]`}
                    value={agenda}
                  />
                ))}
                {agendaState.agendasToReshuffle.map((agenda, i) => (
                  <input
                    key={`agendasToReshuffle-${agenda}`}
                    type="hidden"
                    name={`agendasToReshuffle[${i}]`}
                    value={agenda}
                  />
                ))}
                {agendaState.agendasToRestore.map((agenda, i) => (
                  <input
                    key={`agendasToRestore-${agenda}`}
                    type="hidden"
                    name={`agendasToRestore[${i}]`}
                    value={agenda}
                  />
                ))}
              </ValidatedForm>
            ) : (
              <>
                <div className="flex flex-wrap">
                  <div className="flex flex-col flex-1">
                    <h3 className="m-0">Owned</h3>
                    {!ownedAgendas.length ? (
                      <p className="m-0">No Agendas</p>
                    ) : (
                      ownedAgendas.map((agenda) => (
                        <p className="m-0" key={agenda.id}>
                          {agenda.cost} - {agenda.name}
                        </p>
                      ))
                    )}
                  </div>
                  <div className="flex flex-col flex-1">
                    <h3 className="m-0">Discarded</h3>
                    {!discardedAgendas.length ? (
                      <p className="m-0">No Agendas</p>
                    ) : (
                      discardedAgendas.map((agenda) => (
                        <p className="m-0" key={agenda.id}>
                          {agenda.cost} - {agenda.name}
                        </p>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex flex-col flex-1 justify-end">
                  <h3 className="m-0">Agenda Decks</h3>
                  <p className="m-0 whitespace-normal">
                    {imperialPlayer.agendaDecks
                      .map((deck) => deck.name)
                      .join(', ')}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-col flex-1 px-2 pb-1 border border-gray-400 rounded">
            <h2 className="m-0">Rewards</h2>
            {!imperialPlayer.rewards.length ? (
              <p className="m-0">No Rewards</p>
            ) : (
              <div className="flex flex-col items-start w-fit py-2">
                {imperialPlayer.rewards.map((reward) => (
                  <p className="m-0" key={reward.id}>
                    {reward.name}
                  </p>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col flex-1 px-2 pb-1 border border-gray-400 rounded">
            <h2 className="m-0">Villains</h2>
            {!imperialPlayer.villains.length ? (
              <p className="m-0">No Villains</p>
            ) : (
              <div className="flex flex-col items-start w-fit-py-2">
                {imperialPlayer.villains.map((villain) => (
                  <p
                    className={clsx('m-0', villain.elite && 'text-red-600')}
                    key={villain.id}
                  >
                    {villain.name}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Empire
