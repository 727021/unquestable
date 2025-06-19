import type { Reducer } from 'react'
import { useCallback, useEffect, useId, useReducer } from 'react'
import EditButton from '~/components/EditButton'
import type { LoaderData as GameLoaderData } from '~/routes/_app.games.$game'
import SubmitButton from '../SubmitButton'
import { useFetcher } from 'react-router'
import type { ActionData } from '~/routes/_app.games.$game.rebels.summary'
import { summarySchema } from '~/routes/_app.games.$game.rebels.summary'
import { useForm } from '@rvf/react-router'
import TextInput from '../TextInput'

type State = {
  editing: boolean
  name: string
  xp: number
}

type Action =
  | { type: 'TOGGLE_EDITING' | 'STOP_EDITING' }
  | { type: 'SET_NAME'; name: string }
  | { type: 'SET_XP'; xp: number }

type Props = {
  rebel: GameLoaderData['game']['rebelPlayers'][0]
  formAction?: string
}

const RebelSummaryManager = ({ rebel, formAction }: Props) => {
  const fetcher = useFetcher<ActionData>()

  const reducer: Reducer<State, Action> = useCallback(
    (state, action) => {
      switch (action.type) {
        case 'TOGGLE_EDITING':
          return {
            name: rebel.name ?? '',
            xp: rebel.xp,
            editing: !state.editing
          }
        case 'STOP_EDITING':
          return {
            name: rebel.name ?? '',
            xp: rebel.xp,
            editing: false
          }
        case 'SET_NAME':
          return { ...state, name: action.name }
        case 'SET_XP':
          return { ...state, xp: action.xp }
        default:
          return state
      }
    },
    [rebel]
  )

  const [summary, update] = useReducer(reducer, {
    editing: false,
    name: rebel.name ?? '',
    xp: rebel.xp
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
    defaultValues: {
      id: rebel.id,
    }
  })

  return (
    <div className="flex flex-col">
      <div className="flex gap-2 justify-between items-center">
        <h2 className="m-0">{rebel.hero.name}</h2>
        <div className="flex gap-2">
          {summary.editing && (
            <SubmitButton
              className="btn btn-sm btn-primary btn-outline"
              formApi={form}
              fetcher={fetcher}
              disabled={
                fetcher?.state === 'loading' || fetcher?.state === 'submitting'
              }
            >
              Save
            </SubmitButton>
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
      </div>
      {summary.editing ? (
        <form
          {...form.getFormProps()}
          className="flex flex-1 gap-2 items-start"
        >
          {form.renderFormIdInput()}
          <div className="flex flex-1 flex-wrap gap-2 justify-between items-center">
            <input type="hidden" name="id" value={rebel.id} />
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
          </div>
        </form>
      ) : (
        <div className="flex flex-1 gap-2 justify-between items-baseline">
          <div className="min-w-4">
            <span className="font-bold">Name:</span> {rebel.name}
          </div>
          <div>
            <span className="font-bold">XP:</span> {rebel.xp}
          </div>
        </div>
      )}
    </div>
  )
}

export default RebelSummaryManager
