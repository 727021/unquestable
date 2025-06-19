import type { FetcherWithComponents } from 'react-router'
import type { LoaderData } from '~/routes/_app.games.$game'
import EditButton from '~/components/EditButton'
import type { Reducer } from 'react'
import { useCallback, useEffect, useId, useReducer } from 'react'
import { useForm } from '@rvf/react-router'
import { summarySchema } from '~/routes/_app.games.$game.empire.summary'
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

  const formId = useId()
  const form = useForm({
    id: formId,
    schema: summarySchema,
    method: 'POST',
    fetcher,
    action: formAction,
    defaultValues: {}
  })

  return (
    <div className="flex flex-1 px-2 py-1 gap-2 border border-gray-400 rounded items-start">
      {summary.editing ? (
        <form
          {...form.getFormProps()}
          className="flex flex-1 gap-2 items-start"
        >
          {form.renderFormIdInput()}
          <div className="flex flex-1 flex-wrap gap-2 justify-between items-center">
            <TextInput
              formApi={form}
              name="name"
              label={<span className="font-bold">Name:</span>}
              inline
              value={summary.name}
              onChange={(e) =>
                update({ type: 'SET_NAME', name: e.target.value })
              }
            />
            <TextInput
              formApi={form}
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
              formApi={form}
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
            formApi={form}
          >
            Save
          </SubmitButton>
        </form>
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
