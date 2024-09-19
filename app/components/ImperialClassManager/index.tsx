import type { FetcherWithComponents } from '@remix-run/react'
import type { LoaderData } from '~/routes/_app.games.$game'
import EditButton from '~/components/EditButton'
import type { Reducer } from 'react'
import { useCallback, useEffect, useReducer } from 'react'
import { ValidatedForm } from 'remix-validated-form'
import { classValidator } from '~/routes/_app.games.$game.empire.class'
import SubmitButton from '~/components/SubmitButton'

type CardId = NonNullable<
  LoaderData['game']['imperialPlayer']
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
  imperialPlayer: NonNullable<LoaderData['game']['imperialPlayer']>
  fetcher?: FetcherWithComponents<any>
  formAction?: string
}

const ImperialClassManager = ({
  imperialPlayer,
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
        case 'ADD_CARD':
          if (imperialPlayer.classCards.some((c) => c.id === action.cardId)) {
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
          if (!imperialPlayer.classCards.some((c) => c.id === action.cardId)) {
            return {
              ...state,
              cardsToRemove: state.cardsToRemove.filter(
                (id) => id !== action.cardId
              ),
              cardsToAdd: state.cardsToAdd.filter((id) => id !== action.cardId)
            }
          }
          return {
            ...state,
            cardsToRemove: [...state.cardsToRemove, action.cardId],
            cardsToAdd: state.cardsToAdd.filter((id) => id !== action.cardId)
          }
      }
    },
    [imperialPlayer.classCards]
  )

  const [classState, updateClass] = useReducer(reducer, initialState)

  useEffect(() => {
    if (fetcher?.data?.success && fetcher.state === 'idle') {
      updateClass({ type: 'STOP_EDITING' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher?.state])

  return (
    <div className="flex flex-col flex-1 px-2 pb-1 border border-gray-400 rounded">
      <div className="flex justify-between items-center w-full">
        <h2 className="m-0">{imperialPlayer.class.name}</h2>
        <EditButton
          active={classState.editing}
          onClick={() => updateClass({ type: 'TOGGLE_EDITING' })}
          disabled={
            fetcher?.state === 'loading' || fetcher?.state === 'submitting'
          }
        />
      </div>
      {classState.editing ? (
        <ValidatedForm
          validator={classValidator}
          method="POST"
          className="flex flex-1 justify-between items-end"
          fetcher={fetcher}
          action={formAction}
        >
          <div className="form-control items-start w-fit py-2 self-start">
            {imperialPlayer.class.cards.map((card) => (
              <label key={card.id} className="label gap-2 flex py-1">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-primary"
                  checked={
                    (imperialPlayer.classCards.some((c) => c.id === card.id) ||
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
          <SubmitButton
            className="btn btn-primary btn-outline"
            fetcher={fetcher}
          >
            Save
          </SubmitButton>
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
        </ValidatedForm>
      ) : (
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
      )}
    </div>
  )
}

export default ImperialClassManager
