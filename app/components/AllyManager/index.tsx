import type { LoaderData as GameLoaderData } from '~/routes/_app.games.$game'
import type { LoaderData } from '~/routes/_app.games.$game.rebels'
import EditButton from '../EditButton'
import clsx from 'clsx'
import type { Reducer } from 'react'
import { useCallback, useEffect, useId, useReducer } from 'react'
import { useFetcher } from '@remix-run/react'
import type { ActionData } from '~/routes/_app.games.$game.rebels.allies'
import { allyValidator } from '~/routes/_app.games.$game.rebels.allies'
import SubmitButton from '../SubmitButton'
import { ValidatedForm } from 'remix-validated-form'
import { XCircleIcon } from '@heroicons/react/24/outline'
import { PlusIcon } from '@heroicons/react/24/solid'

type TroopId = LoaderData['troops'][0]['id']

type State = {
  editing: boolean
  alliesToAdd: TroopId[]
  alliesToRemove: TroopId[]
  chosenAlly: TroopId
}

type Action =
  | {
      type: 'TOGGLE_EDITING' | 'STOP_EDITING'
    }
  | {
      type: 'ADD_ALLY' | 'REMOVE_ALLY' | 'CHOOSE_ALLY'
      allyId: TroopId
    }

const initialState: State = {
  editing: false,
  alliesToAdd: [],
  alliesToRemove: [],
  chosenAlly: -1
}

type Props = {
  allies: GameLoaderData['game']['allies']
  allAllies: LoaderData['troops']
  formAction?: string
}

const AllyManager = ({ allies, allAllies, formAction }: Props) => {
  const reducer: Reducer<State, Action> = useCallback(
    (state, action) => {
      switch (action.type) {
        case 'TOGGLE_EDITING':
          return { ...initialState, editing: !state.editing }
        case 'STOP_EDITING':
          return { ...initialState, editing: false }
        case 'ADD_ALLY':
          if (allies.some((a) => a.id === action.allyId)) {
            return {
              ...state,
              alliesToAdd: state.alliesToAdd.filter(
                (id) => id !== action.allyId
              ),
              alliesToRemove: state.alliesToRemove.filter(
                (id) => id !== action.allyId
              ),
              chosenAlly: initialState.chosenAlly
            }
          }
          return {
            ...state,
            alliesToAdd: [...state.alliesToAdd, action.allyId],
            alliesToRemove: state.alliesToRemove.filter(
              (id) => id !== action.allyId
            ),
            chosenAlly: initialState.chosenAlly
          }
        case 'REMOVE_ALLY':
          if (allies.some((a) => a.id === action.allyId)) {
            return {
              ...state,
              alliesToAdd: state.alliesToAdd.filter(
                (id) => id !== action.allyId
              ),
              alliesToRemove: [...state.alliesToRemove, action.allyId],
              chosenAlly: initialState.chosenAlly
            }
          }
          return {
            ...state,
            alliesToAdd: state.alliesToAdd.filter((id) => id !== action.allyId),
            alliesToRemove: state.alliesToRemove.filter(
              (id) => id !== action.allyId
            ),
            chosenAlly: initialState.chosenAlly
          }
        case 'CHOOSE_ALLY':
          return {
            ...state,
            chosenAlly: action.allyId
          }
        default:
          return state
      }
    },
    [allies]
  )

  const [allyState, updateAllies] = useReducer(reducer, initialState)

  const fetcher = useFetcher<ActionData>()

  const formId = useId()

  useEffect(() => {
    if (fetcher.data?.success && fetcher.state === 'idle') {
      updateAllies({ type: 'STOP_EDITING' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.state])

  const alliesToShow = [
    ...allies.filter((a) => !allyState.alliesToRemove.includes(a.id)),
    ...allAllies.filter((a) => allyState.alliesToAdd.includes(a.id))
  ]

  return (
    <div className="flex flex-col flex-1 px-2 py-1 gap-2 border border-gray-400 rounded">
      <div className="flex justify-between items-center w-full">
        <h3 className="m-0">Allies</h3>
        <div className="flex gap-2">
          {allyState.editing && (
            <SubmitButton
              className="btn btn-sm btn-primary btn-outline"
              formId={formId}
              form={formId}
              fetcher={fetcher}
              disabled={
                fetcher.state === 'loading' || fetcher.state === 'submitting'
              }
            >
              Save
            </SubmitButton>
          )}
          <EditButton
            active={allyState.editing}
            onClick={() => updateAllies({ type: 'TOGGLE_EDITING' })}
            hideLabel
            disabled={
              fetcher.state === 'loading' || fetcher.state === 'submitting'
            }
          />
        </div>
      </div>
      {allyState.editing ? (
        <ValidatedForm
          validator={allyValidator}
          method="POST"
          className="flex flex-1 flex-col gap-2"
          fetcher={fetcher}
          action={formAction}
          id={formId}
        >
          <div className="flex flex-col items-start w-fit">
            {!alliesToShow.length ? (
              <p className="m-0">No Allies</p>
            ) : (
              alliesToShow.map((ally) => (
                <div key={ally.id} className="flex gap-1 items-center">
                  <p className={clsx('m-0', ally.elite && 'text-red-600')}>
                    {ally.name}
                  </p>
                  <button
                    className="btn btn-xs btn-circle btn-ghost tooltip"
                    data-tip="Remove"
                    type="button"
                    onClick={() =>
                      updateAllies({ type: 'REMOVE_ALLY', allyId: ally.id })
                    }
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="join">
            <select
              className="join-item select select-bordered"
              value={allyState.chosenAlly}
              onChange={(e) =>
                updateAllies({
                  type: 'CHOOSE_ALLY',
                  allyId: parseInt(e.target.value, 10)
                })
              }
            >
              <option value="-1" disabled>
                Choose an Ally
              </option>
              {allAllies
                .filter((ally) => !alliesToShow.some((a) => a.id === ally.id))
                .map((ally) => (
                  <option key={ally.id} value={ally.id}>
                    {ally.unique && '* '}
                    {ally.name}
                    {ally.elite && ' (Elite)'}
                  </option>
                ))}
            </select>
            <button
              className="join-item btn btn-outline"
              type="button"
              onClick={() =>
                allyState.chosenAlly !== -1 &&
                updateAllies({
                  type: 'ADD_ALLY',
                  allyId: allyState.chosenAlly
                })
              }
              disabled={allyState.chosenAlly === -1}
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
          {allyState.alliesToAdd.map((id, i) => (
            <input
              key={`alliesToAdd-${i}`}
              type="hidden"
              name={`alliesToAdd[${i}]`}
              value={id}
            />
          ))}
          {allyState.alliesToRemove.map((id, i) => (
            <input
              key={`alliesToRemove-${i}`}
              type="hidden"
              name={`alliesToRemove[${i}]`}
              value={id}
            />
          ))}
        </ValidatedForm>
      ) : !allies.length ? (
        <p className="m-0">No Allies</p>
      ) : (
        <div className="flex flex-col items-start w-fit">
          {allies.map((ally) => (
            <p
              key={ally.id}
              className={clsx('m-0', ally.elite && 'text-red-600')}
            >
              {ally.name}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

export default AllyManager
