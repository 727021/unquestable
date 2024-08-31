import type { FetcherWithComponents } from '@remix-run/react'
import { useCallback, useEffect, useReducer, type Reducer } from 'react'
import type { LoaderData } from '~/routes/_app.games.$game'
import EditButton from '../EditButton'
import { ValidatedForm } from 'remix-validated-form'
import { agendaValidator } from '~/routes/_app.games.$game.empire.agendas'
import { PlusIcon } from '@heroicons/react/24/solid'
import {
  ArrowDownCircleIcon,
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon
} from '@heroicons/react/24/outline'
import SubmitButton from '../SubmitButton'

type AgendaId = NonNullable<
  LoaderData['game']['imperialPlayer']
>['agendas'][0]['agenda']['id']

type State = {
  editing: boolean
  agendasToAdd: AgendaId[]
  agendasToDiscard: AgendaId[]
  agendasToRestore: AgendaId[]
  agendasToReshuffle: AgendaId[]
  chosenAgenda: AgendaId
}

type Action =
  | { type: 'TOGGLE_EDITING' | 'STOP_EDITING' }
  | {
      type:
        | 'ADD_AGENDA'
        | 'DISCARD_AGENDA'
        | 'RESTORE_AGENDA'
        | 'RESHUFFLE_AGENDA'
        | 'CHOOSE_AGENDA'
      agenda: AgendaId
    }

const initialAgendaState: State = {
  editing: false,
  agendasToAdd: [],
  agendasToDiscard: [],
  agendasToRestore: [],
  agendasToReshuffle: [],
  chosenAgenda: -1
}

type Props = {
  imperialPlayer: NonNullable<LoaderData['game']['imperialPlayer']>
  fetcher?: FetcherWithComponents<any>
  formAction?: string
}

const AgendaManager = ({ imperialPlayer, fetcher, formAction }: Props) => {
  const allAgendas = imperialPlayer.agendaDecks
    .map((deck) => deck.agendas)
    .flat()

  const initialOwnedAgendas = allAgendas
    .filter((agenda) =>
      imperialPlayer.agendas.some(
        (a) => a.agendaId === agenda.id && !a.discarded
      )
    )
    .map((a) => a.id)
  const initialDiscardedAgendas = allAgendas
    .filter((agenda) =>
      imperialPlayer.agendas.some(
        (a) => a.agendaId === agenda.id && a.discarded
      )
    )
    .map((a) => a.id)

  const agendaReducer: Reducer<State, Action> = useCallback(
    (state, action) => {
      switch (action.type) {
        case 'ADD_AGENDA': // unowned -> owned
          if (initialOwnedAgendas.includes(action.agenda)) {
            return {
              ...state,
              agendasToAdd: state.agendasToAdd.filter(
                (agenda) => agenda !== action.agenda
              ),
              agendasToReshuffle: state.agendasToReshuffle.filter(
                (agenda) => agenda !== action.agenda
              ),
              chosenAgenda: initialAgendaState.chosenAgenda
            }
          }
          if (initialDiscardedAgendas.includes(action.agenda)) {
            return {
              ...state,
              agendasToAdd: state.agendasToAdd.filter(
                (agenda) => agenda !== action.agenda
              ),
              agendasToReshuffle: state.agendasToReshuffle.filter(
                (agenda) => agenda !== action.agenda
              ),
              agendasToRestore: [...state.agendasToRestore, action.agenda],
              chosenAgenda: initialAgendaState.chosenAgenda
            }
          }
          return {
            ...state,
            agendasToReshuffle: state.agendasToReshuffle.filter(
              (agenda) => agenda !== action.agenda
            ),
            agendasToAdd: [...state.agendasToAdd, action.agenda],
            chosenAgenda: initialAgendaState.chosenAgenda
          }
        case 'DISCARD_AGENDA': // owned -> discarded
          if (initialDiscardedAgendas.includes(action.agenda)) {
            return {
              ...state,
              agendasToRestore: state.agendasToRestore.filter(
                (agenda) => agenda !== action.agenda
              ),
              agendasToAdd: state.agendasToAdd.filter(
                (agenda) => agenda !== action.agenda
              ),
              agendasToDiscard: state.agendasToDiscard.filter(
                (agenda) => agenda !== action.agenda
              ),
              chosenAgenda: initialAgendaState.chosenAgenda
            }
          }
          return {
            ...state,
            agendasToDiscard: [...state.agendasToDiscard, action.agenda],
            agendasToAdd: state.agendasToAdd.filter(
              (agenda) => agenda !== action.agenda
            ),
            agendasToRestore: state.agendasToRestore.filter(
              (agenda) => agenda !== action.agenda
            )
          }
        case 'RESTORE_AGENDA': // discarded -> owned
          if (initialOwnedAgendas.includes(action.agenda)) {
            return {
              ...state,
              agendasToRestore: state.agendasToRestore.filter(
                (agenda) => agenda !== action.agenda
              ),
              agendasToAdd: state.agendasToAdd.filter(
                (agenda) => agenda !== action.agenda
              ),
              agendasToDiscard: state.agendasToDiscard.filter(
                (agenda) => agenda !== action.agenda
              )
            }
          }
          if (initialDiscardedAgendas.includes(action.agenda)) {
            return {
              ...state,
              agendasToRestore: [...state.agendasToRestore, action.agenda],
              agendasToDiscard: state.agendasToDiscard.filter(
                (agenda) => agenda !== action.agenda
              )
            }
          }
          return {
            ...state,
            agendasToAdd: [...state.agendasToAdd, action.agenda],
            agendasToReshuffle: state.agendasToReshuffle.filter(
              (agenda) => agenda !== action.agenda
            )
          }
        case 'RESHUFFLE_AGENDA': // owned|discarded -> unowned
          if (
            !initialOwnedAgendas.includes(action.agenda) &&
            !initialDiscardedAgendas.includes(action.agenda)
          ) {
            return {
              ...state,
              agendasToReshuffle: state.agendasToReshuffle.filter(
                (agenda) => agenda !== action.agenda
              ),
              agendasToAdd: state.agendasToAdd.filter(
                (agenda) => agenda !== action.agenda
              ),
              agendasToDiscard: state.agendasToDiscard.filter(
                (agenda) => agenda !== action.agenda
              ),
              agendasToRestore: state.agendasToRestore.filter(
                (agenda) => agenda !== action.agenda
              )
            }
          }
          return {
            ...state,
            agendasToReshuffle: [...state.agendasToReshuffle, action.agenda],
            agendasToAdd: state.agendasToAdd.filter(
              (agenda) => agenda !== action.agenda
            ),
            agendasToDiscard: state.agendasToDiscard.filter(
              (agenda) => agenda !== action.agenda
            ),
            agendasToRestore: state.agendasToRestore.filter(
              (agenda) => agenda !== action.agenda
            )
          }
        case 'CHOOSE_AGENDA':
          return {
            ...state,
            chosenAgenda: action.agenda
          }
        case 'TOGGLE_EDITING':
          return {
            ...initialAgendaState,
            editing: !state.editing
          }
        case 'STOP_EDITING':
          return {
            ...state,
            editing: false
          }
      }
    },
    [initialDiscardedAgendas, initialOwnedAgendas]
  )

  const [agendaState, changeAgenda] = useReducer(
    agendaReducer,
    initialAgendaState
  )
  useEffect(() => {
    if (fetcher?.data?.success && fetcher.state === 'idle') {
      // Exit edit mode after data is refreshed if the last submission was successful
      changeAgenda({ type: 'STOP_EDITING' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher?.state])

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
    <div className="flex flex-col flex-1 px-2 pb-1 border rounded border-gray-400">
      <div className="flex justify-between items-center w-full">
        <h2 className="m-0">Agendas</h2>
        <span className="flex gap-2 items-center">
          {agendaState.editing && <p className="m-0 text-primary">Editing</p>}
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
          fetcher={fetcher}
          action={formAction}
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
              {!discardedAgendas.length && <p className="m-0">No Agendas</p>}
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
            <SubmitButton
              className="btn btn-primary btn-outline"
              fetcher={fetcher}
            >
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
              {imperialPlayer.agendaDecks.map((deck) => deck.name).join(', ')}
            </p>
          </div>
        </>
      )}
    </div>
  )
}

export default AgendaManager
