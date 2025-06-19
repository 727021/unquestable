import type { LoaderData as GameLoaderData } from '~/routes/_app.games.$game'
import EditButton from '../EditButton'
import type { Reducer } from 'react'
import { useCallback, useEffect, useId, useReducer } from 'react'
import { useFetcher } from 'react-router'
import type { ActionData } from '~/routes/_app.games.$game.rebels.class'
import { classSchema } from '~/routes/_app.games.$game.rebels.class'
import SubmitButton from '../SubmitButton'
import { useForm } from '@rvf/react-router'

type CardId = NonNullable<
  GameLoaderData['game']['rebelPlayers'][0]
>['classCards'][0]['id']

type State = {
  editing: boolean
  cardsToAdd: CardId[]
  cardsToRemove: CardId[]
}

type Action =
  | { type: 'TOGGLE_EDITING' | 'STOP_EDITING' }
  | { type: 'ADD_CARD' | 'REMOVE_CARD'; cardId: CardId }

const initialState: State = {
  editing: false,
  cardsToAdd: [],
  cardsToRemove: []
}

type Props = {
  rebel: GameLoaderData['game']['rebelPlayers'][0]
  formAction?: string
}

const RebelClassManager = ({ rebel, formAction }: Props) => {
  const reducer: Reducer<State, Action> = useCallback(
    (state, action) => {
      switch (action.type) {
        case 'TOGGLE_EDITING':
          return { ...initialState, editing: !state.editing }
        case 'STOP_EDITING':
          return { ...initialState, editing: false }
        case 'ADD_CARD':
          if (rebel.classCards.some((c) => c.id === action.cardId)) {
            return {
              ...state,
              cardsToAdd: state.cardsToAdd.filter((id) => id !== action.cardId),
              cardsToRemove: state.cardsToRemove.filter(
                (id) => id !== action.cardId
              )
            }
          }
          return {
            ...state,
            cardsToAdd: [...state.cardsToAdd, action.cardId],
            cardsToRemove: state.cardsToRemove.filter(
              (id) => id !== action.cardId
            )
          }
        case 'REMOVE_CARD':
          if (!rebel.classCards.some((c) => c.id === action.cardId)) {
            return {
              ...state,
              cardsToAdd: state.cardsToAdd.filter((id) => id !== action.cardId),
              cardsToRemove: state.cardsToRemove.filter(
                (id) => id !== action.cardId
              )
            }
          }
          return {
            ...state,
            cardsToAdd: state.cardsToAdd.filter((id) => id !== action.cardId),
            cardsToRemove: [...state.cardsToRemove, action.cardId]
          }
      }
    },
    [rebel.classCards]
  )

  const [classState, updateClass] = useReducer(reducer, initialState)

  const fetcher = useFetcher<ActionData>()

  useEffect(() => {
    if (fetcher.data?.success && fetcher.state === 'idle') {
      updateClass({ type: 'STOP_EDITING' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher?.state])

  const formId = useId()
  const form = useForm({
    id: formId,
    schema: classSchema,
    method: 'POST',
    fetcher,
    action: formAction,
    defaultValues: {
      cardsToAdd: [],
      cardsToRemove: [],
      id: rebel.id
    }
  })

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center w-full">
        <h3 className="m-0">Class</h3>
        <div className="flex gap-2">
          {classState.editing && (
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
            active={classState.editing}
            onClick={() => updateClass({ type: 'TOGGLE_EDITING' })}
            disabled={
              fetcher.state === 'loading' || fetcher.state === 'submitting'
            }
            hideLabel
          />
        </div>
      </div>
      {classState.editing ? (
        <form
          {...form.getFormProps()}
          className="flex flex-1 justify-between items-end"
        >
          {form.renderFormIdInput()}
          <div className="form-control items-start w-fit py-2 self-start">
            {rebel.hero.class?.cards.map((card) => (
              <label key={card.id} className="label gap-2 flex py-1">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-primary"
                  checked={
                    (rebel.classCards.some((c) => c.id === card.id) ||
                      classState.cardsToAdd.includes(card.id)) &&
                    !classState.cardsToRemove.includes(card.id)
                  }
                  onChange={(e) =>
                    updateClass({
                      type: e.target.checked ? 'ADD_CARD' : 'REMOVE_CARD',
                      cardId: card.id
                    })
                  }
                />
                <span className="label-text">
                  {card.cost} XP - {card.name}
                </span>
              </label>
            ))}
          </div>
          <input type="hidden" name="id" value={rebel.id} />
          {classState.cardsToAdd.map((card, i) => (
            <input
              key={`cardsToAdd-${card}`}
              type="hidden"
              name={`cardsToAdd[${i}]`}
              value={card}
            />
          ))}
          {classState.cardsToRemove.map((card, i) => (
            <input
              key={`cardsToRemove-${card}`}
              type="hidden"
              name={`cardsToRemove[${i}]`}
              value={card}
            />
          ))}
        </form>
      ) : (
        <div className="form-control items-start w-fit py-2">
          {rebel.hero.class?.cards.map((card) => (
            <label
              key={card.id}
              className="label cursor-default gap-2 flex py-1"
            >
              <input
                type="checkbox"
                className="checkbox checkbox-sm cursor-default"
                checked={rebel.classCards.some((c) => c.id === card.id)}
                readOnly
              />
              <span className="label-text">
                {card.cost} XP - {card.name}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export default RebelClassManager
