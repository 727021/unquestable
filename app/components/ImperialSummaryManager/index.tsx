import type { FetcherWithComponents } from 'react-router'
import type { LoaderData } from '~/routes/_app.games.$game'
import EditButton from '~/components/EditButton'
import type { Reducer } from 'react'
import { useCallback, useEffect, useReducer } from 'react'
import { ValidatedForm } from 'remix-validated-form'
import { summaryValidator } from '~/routes/_app.games.$game.empire.summary'
import SubmitButton from '~/components/SubmitButton'
import TextInput from '~/components/TextInput'

type State = {
  editing: boolean
  name: string
  xp: number
  influence: number
}

type Action =
  | { type: 'TOGGLE_EDITING' | 'STOP_EDITING' }
  | { type: 'SET_NAME'; name: string }
  | { type: 'SET_XP'; xp: number }
  | { type: 'SET_INFLUENCE'; influence: number }

type Props = {
  imperialPlayer: NonNullable<LoaderData['game']['imperialPlayer']>
  fetcher?: FetcherWithComponents<any>
  formAction?: string
}

const ImperialSummaryManager = ({
  imperialPlayer,
  fetcher,
  formAction
}: Props) => {
  const reducer: Reducer<State, Action> = useCallback(
    (state, action) => {
      switch (action.type) {
        case 'TOGGLE_EDITING':
          return {
            name: imperialPlayer.name ?? '',
            xp: imperialPlayer.xp,
            influence: imperialPlayer.influence,
            editing: !state.editing
          }
        case 'STOP_EDITING':
          return {
            name: imperialPlayer.name ?? '',
            xp: imperialPlayer.xp,
            influence: imperialPlayer.influence,
            editing: false
          }
        case 'SET_NAME':
          return { ...state, name: action.name }
        case 'SET_XP':
          return { ...state, xp: action.xp }
        case 'SET_INFLUENCE':
          return { ...state, influence: action.influence }
        default:
          return state
      }
    },
    [imperialPlayer]
  )

  const [summary, update] = useReducer(reducer, {
    editing: false,
    name: imperialPlayer.name ?? '',
    xp: imperialPlayer.xp,
    influence: imperialPlayer.influence
  })

  useEffect(() => {
    if (fetcher?.data?.success && fetcher.state === 'idle') {
      update({ type: 'STOP_EDITING' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher?.state])

  return (
    <div className="flex flex-1 px-2 py-1 gap-2 border border-gray-400 rounded items-start">
      {summary.editing ? (
        <ValidatedForm
          validator={summaryValidator}
          method="POST"
          className="flex flex-1 gap-2 items-start"
          fetcher={fetcher}
          action={formAction}
        >
          <div className="flex flex-1 flex-wrap gap-2 justify-between items-center">
            <TextInput
              name="name"
              label={<span className="font-bold">Name:</span>}
              inline
              value={summary.name}
              onChange={(e) =>
                update({ type: 'SET_NAME', name: e.target.value })
              }
            />
            <TextInput
              type="number"
              name="xp"
              label={<span className="font-bold">XP:</span>}
              inline
              value={summary.xp.toString()}
              onChange={(e) =>
                update({
                  type: 'SET_XP',
                  xp: parseInt(e.target.value, 10) || 0
                })
              }
              min={0}
            />
            <TextInput
              type="number"
              name="influence"
              label={<span className="font-bold">Influence:</span>}
              inline
              value={summary.influence.toString()}
              onChange={(e) =>
                update({
                  type: 'SET_INFLUENCE',
                  influence: parseInt(e.target.value, 10) || 0
                })
              }
              min={0}
            />
          </div>
          <SubmitButton
            className="btn btn-sm btn-primary btn-outline"
            fetcher={fetcher}
          >
            Save
          </SubmitButton>
        </ValidatedForm>
      ) : (
        <div className="flex flex-1 gap-2 justify-between items-center my-auto">
          <div className="min-w-4">
            <span className="font-bold">Name:</span> {imperialPlayer.name}
          </div>
          <div>
            <span className="font-bold">XP:</span> {imperialPlayer.xp}
          </div>
          <div className="flex gap-2 items-center">
            <span>
              <span className="font-bold">Influence:</span>{' '}
              {imperialPlayer.influence}
            </span>
          </div>
        </div>
      )}
      <EditButton
        active={summary.editing}
        onClick={() => update({ type: 'TOGGLE_EDITING' })}
        hideLabel
        disabled={
          fetcher?.state === 'loading' || fetcher?.state === 'submitting'
        }
      />
    </div>
  )
}

export default ImperialSummaryManager
