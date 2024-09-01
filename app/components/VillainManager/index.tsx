import type { FetcherWithComponents } from '@remix-run/react'
import clsx from 'clsx'
import type { Reducer } from 'react'
import { useCallback, useEffect, useReducer } from 'react'
import type { LoaderData as GameLoaderData } from '~/routes/_app.games.$game'
import type { LoaderData } from '~/routes/_app.games.$game.empire'
import EditButton from '../EditButton'
import { ValidatedForm } from 'remix-validated-form'
import { villainValidator } from '~/routes/_app.games.$game.empire.villains'
import { XCircleIcon } from '@heroicons/react/24/outline'
import { PlusIcon } from '@heroicons/react/24/solid'
import SubmitButton from '../SubmitButton'

type VillainId = NonNullable<
  GameLoaderData['game']['imperialPlayer']
>['villains'][0]['id']

type State = {
  editing: boolean
  villainsToAdd: VillainId[]
  villainsToRemove: VillainId[]
  chosenVillain: VillainId
}

type Action =
  | { type: 'TOGGLE_EDITING' | 'STOP_EDITING' }
  | {
      type: 'ADD_VILLAIN' | 'REMOVE_VILLAIN' | 'CHOOSE_VILLAIN'
      villainId: VillainId
    }

const initialState: State = {
  editing: false,
  villainsToAdd: [],
  villainsToRemove: [],
  chosenVillain: -1
}

type Props = {
  imperialPlayer: NonNullable<GameLoaderData['game']['imperialPlayer']>
  allVillains: LoaderData['troops']
  fetcher?: FetcherWithComponents<any>
  formAction?: string
}

const VillainManager = ({
  imperialPlayer,
  allVillains,
  fetcher,
  formAction
}: Props) => {
  const reducer: Reducer<State, Action> = useCallback(
    (state, action) => {
      switch (action.type) {
        case 'TOGGLE_EDITING':
          return { ...initialState, editing: !state.editing }
        case 'STOP_EDITING':
          return { ...initialState, editing: false }
        case 'ADD_VILLAIN':
          if (imperialPlayer.villains.some((v) => v.id === action.villainId)) {
            return {
              ...state,
              villainsToAdd: state.villainsToAdd.filter(
                (id) => id !== action.villainId
              ),
              villainsToRemove: state.villainsToRemove.filter(
                (id) => id !== action.villainId
              ),
              chosenVillain: initialState.chosenVillain
            }
          } else {
            return {
              ...state,
              villainsToAdd: [...state.villainsToAdd, action.villainId],
              villainsToRemove: state.villainsToRemove.filter(
                (id) => id !== action.villainId
              ),
              chosenVillain: initialState.chosenVillain
            }
          }
        case 'REMOVE_VILLAIN':
          if (!imperialPlayer.villains.some((v) => v.id === action.villainId)) {
            return {
              ...state,
              villainsToAdd: state.villainsToAdd.filter(
                (id) => id !== action.villainId
              ),
              villainsToRemove: state.villainsToRemove.filter(
                (id) => id !== action.villainId
              ),
              chosenVillain: initialState.chosenVillain
            }
          }
          return {
            ...state,
            villainsToAdd: state.villainsToAdd.filter(
              (id) => id !== action.villainId
            ),
            villainsToRemove: [...state.villainsToRemove, action.villainId],
            chosenVillain: initialState.chosenVillain
          }
        case 'CHOOSE_VILLAIN':
          return {
            ...state,
            chosenVillain: action.villainId
          }
      }
    },
    [imperialPlayer.villains]
  )

  const [villainState, updateVillains] = useReducer(reducer, initialState)

  useEffect(() => {
    if (fetcher?.data?.success && fetcher.state === 'idle') {
      updateVillains({ type: 'STOP_EDITING' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher?.state])

  const villainsToShow = [
    ...imperialPlayer.villains.filter(
      (v) => !villainState.villainsToRemove.includes(v.id)
    ),
    ...allVillains.filter((v) => villainState.villainsToAdd.includes(v.id))
  ]

  return (
    <div className="flex flex-col flex-1 px-2 pb-1 border border-gray-400 rounded">
      <div className="flex justify-between items-center w-full">
        <h2 className="m-0">Villains</h2>
        <EditButton
          active={villainState.editing}
          onClick={() => updateVillains({ type: 'TOGGLE_EDITING' })}
          disabled={
            fetcher?.state === 'loading' || fetcher?.state === 'submitting'
          }
        />
      </div>
      {villainState.editing ? (
        <ValidatedForm
          validator={villainValidator}
          method="POST"
          className="flex flex-1 flex-col gap-2"
          fetcher={fetcher}
          action={formAction}
        >
          <div className="flex flex-col items-start w-fit py-2">
            {villainsToShow.length === 0 ? (
              <p className="m-0">No Villains</p>
            ) : (
              villainsToShow.map((villain) => (
                <div key={villain.id} className="flex gap-1 items-center">
                  <p className={clsx('m-0', villain.elite && 'text-red-600')}>
                    {villain.name}
                  </p>
                  <button
                    className="btn btn-xs btn-circle btn-ghost tooltip"
                    data-tip="Remove"
                    type="button"
                    onClick={() =>
                      updateVillains({
                        type: 'REMOVE_VILLAIN',
                        villainId: villain.id
                      })
                    }
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="flex justify-between items-center flex-1">
            <div className="join">
              <select
                className="join-item select select-bordered"
                value={villainState.chosenVillain}
                onChange={(e) =>
                  updateVillains({
                    type: 'CHOOSE_VILLAIN',
                    villainId: parseInt(e.target.value, 10)
                  })
                }
              >
                <option value="-1" disabled>
                  Choose a Villain
                </option>
                {allVillains
                  .filter(
                    (villain) =>
                      !villainsToShow.some((vt) => vt.id === villain.id)
                  )
                  .map((villain) => (
                    <option key={villain.id} value={villain.id}>
                      {villain.unique && '* '}
                      {villain.name}
                      {villain.elite && ' (Elite)'}
                    </option>
                  ))}
              </select>
              <button
                className="join-item btn btn-outline"
                type="button"
                onClick={() =>
                  villainState.chosenVillain > -1 &&
                  updateVillains({
                    type: 'ADD_VILLAIN',
                    villainId: villainState.chosenVillain
                  })
                }
                disabled={villainState.chosenVillain === -1}
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
            <SubmitButton
              className="btn btn-primary btn-outline"
              fetcher={fetcher}
            >
              Save
            </SubmitButton>
            {villainState.villainsToAdd.map((id, i) => (
              <input
                key={`villainsToAdd-${id}`}
                type="hidden"
                name={`villainsToAdd[${i}]`}
                value={id}
              />
            ))}
            {villainState.villainsToRemove.map((id, i) => (
              <input
                key={`villainsToRemove-${id}`}
                type="hidden"
                name={`villainsToRemove[${i}]`}
                value={id}
              />
            ))}
          </div>
        </ValidatedForm>
      ) : !imperialPlayer.villains.length ? (
        <p className="m-0 py-2">No Villains</p>
      ) : (
        <div className="flex flex-col items-start w-fit py-2">
          {imperialPlayer.villains.map((villain) => (
            <p
              key={villain.id}
              className={clsx('m-0', villain.elite && 'text-red-600')}
            >
              {villain.name}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

export default VillainManager
