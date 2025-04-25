import type { LoaderData as GameLoaderData } from '~/routes/_app.games.$game'
import type { LoaderData } from '~/routes/_app.games.$game.rebels'
import EditButton from '../EditButton'
import { sortItems } from '~/utils/sortItems'
import type { Reducer } from 'react'
import { useCallback, useEffect, useId, useMemo, useReducer } from 'react'
import { useFetcher } from 'react-router-dom'
import type { ActionData } from '~/routes/_app.games.$game.rebels.items'
import { itemValidator } from '~/routes/_app.games.$game.rebels.items'
import SubmitButton from '../SubmitButton'
import TextInput from '../TextInput'
import { ValidatedForm } from 'remix-validated-form'
import { XCircleIcon } from '@heroicons/react/24/outline'
import { PlusIcon } from '@heroicons/react/24/solid'

type ItemId = LoaderData['items'][0]['id']

type State = {
  editing: boolean
  itemsToAdd: ItemId[]
  itemsToRemove: ItemId[]
  chosenItem: ItemId
  credits: number
}

type Action =
  | {
      type: 'TOGGLE_EDITING' | 'STOP_EDITING'
    }
  | {
      type: 'ADD_ITEM' | 'REMOVE_ITEM' | 'CHOOSE_ITEM'
      itemId: ItemId
    }
  | {
      type: 'SET_CREDITS'
      credits: number
    }

type Props = {
  items: GameLoaderData['game']['items']
  allItems: LoaderData['items']
  credits: GameLoaderData['game']['credits']
  formAction?: string
}

const ItemManager = ({ items, allItems, credits, formAction }: Props) => {
  const initialState = useMemo<State>(
    () => ({
      editing: false,
      itemsToAdd: [],
      itemsToRemove: [],
      chosenItem: -1,
      credits
    }),
    [credits]
  )

  const reducer: Reducer<State, Action> = useCallback(
    (state, action) => {
      switch (action.type) {
        case 'TOGGLE_EDITING':
          return { ...initialState, editing: !state.editing }
        case 'STOP_EDITING':
          return { ...initialState, editing: false }
        case 'ADD_ITEM':
          if (items.some((i) => i.id === action.itemId)) {
            return {
              ...state,
              itemsToAdd: state.itemsToAdd.filter((id) => id !== action.itemId),
              itemsToRemove: state.itemsToRemove.filter(
                (id) => id !== action.itemId
              ),
              chosenItem: initialState.chosenItem
            }
          }
          return {
            ...state,
            itemsToAdd: [...state.itemsToAdd, action.itemId],
            itemsToRemove: state.itemsToRemove.filter(
              (id) => id !== action.itemId
            ),
            chosenItem: initialState.chosenItem
          }
        case 'REMOVE_ITEM':
          if (!items.some((i) => i.id === action.itemId)) {
            return {
              ...state,
              itemsToAdd: state.itemsToAdd.filter((id) => id !== action.itemId),
              itemsToRemove: state.itemsToRemove.filter(
                (id) => id !== action.itemId
              ),
              chosenItem: initialState.chosenItem
            }
          }
          return {
            ...state,
            itemsToAdd: state.itemsToAdd.filter((id) => id !== action.itemId),
            itemsToRemove: [...state.itemsToRemove, action.itemId],
            chosenItem: initialState.chosenItem
          }
        case 'CHOOSE_ITEM':
          return { ...state, chosenItem: action.itemId }
        case 'SET_CREDITS':
          return { ...state, credits: action.credits }
        default:
          return state
      }
    },
    [initialState, items]
  )

  const [itemState, updateItems] = useReducer(reducer, initialState)

  const fetcher = useFetcher<ActionData>()

  const formId = useId()

  useEffect(() => {
    if (fetcher.data?.success && fetcher.state === 'idle') {
      updateItems({ type: 'STOP_EDITING' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.state])

  const itemsToShow = [
    ...items.filter((i) => !itemState.itemsToRemove.includes(i.id)),
    ...allItems.filter((i) => itemState.itemsToAdd.includes(i.id))
  ]

  return (
    <div className="flex flex-col flex-1 px-2 py-1 gap-2 border border-gray-400 rounded">
      <div className="flex flex-col">
        <div className="flex justify-between items-center w-full">
          <h3 className="m-0">Items</h3>
          <div className="flex gap-2">
            {itemState.editing && (
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
              active={itemState.editing}
              onClick={() => updateItems({ type: 'TOGGLE_EDITING' })}
              hideLabel
              disabled={
                fetcher.state === 'loading' || fetcher.state === 'submitting'
              }
            />
          </div>
        </div>
        {itemState.editing ? (
          <TextInput
            type="number"
            name="credits"
            formId={formId}
            form={formId}
            label={<span className="font-bold">Credits:</span>}
            inline
            value={itemState.credits}
            onChange={(e) =>
              updateItems({
                type: 'SET_CREDITS',
                credits: parseInt(e.target.value, 10)
              })
            }
          />
        ) : (
          <div>
            <span className="font-bold">Credits:</span> {credits}
          </div>
        )}
      </div>
      <hr className="border-gray-400 my-0" />
      {itemState.editing ? (
        <ValidatedForm
          validator={itemValidator}
          method="POST"
          className="flex flex-1 flex-col gap-2"
          fetcher={fetcher}
          action={formAction}
          id={formId}
        >
          <div className="flex flex-col">
            {!itemsToShow.length ? (
              <p className="m-0">No Items</p>
            ) : (
              sortItems(itemsToShow).map((item) => (
                <div key={item.id} className="flex gap-1 items-center">
                  <p className="m-0">
                    {item.cost} CR - {item.name} ({'I'.repeat(item.tier)})
                  </p>
                  <button
                    className="btn btn-xs btn-circle btn-ghost tooltip"
                    data-tip="Remove"
                    type="button"
                    onClick={() =>
                      updateItems({ type: 'REMOVE_ITEM', itemId: item.id })
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
              value={itemState.chosenItem}
              onChange={(e) =>
                updateItems({
                  type: 'CHOOSE_ITEM',
                  itemId: parseInt(e.target.value, 10)
                })
              }
            >
              <option value="-1" disabled>
                Choose an Item
              </option>
              {sortItems(allItems)
                .filter((i) => !itemsToShow.some((item) => item.id === i.id))
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.cost} CR - {item.name} ({'I'.repeat(item.tier)})
                  </option>
                ))}
            </select>
            <button
              className="join-item btn btn-outline"
              type="button"
              onClick={() =>
                itemState.chosenItem !== -1 &&
                updateItems({ type: 'ADD_ITEM', itemId: itemState.chosenItem })
              }
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
          {itemState.itemsToAdd.map((id, i) => (
            <input
              key={`itemsToAdd-${i}`}
              type="hidden"
              name={`itemsToAdd[${i}]`}
              value={id}
            />
          ))}
          {itemState.itemsToRemove.map((id, i) => (
            <input
              key={`itemsToRemove-${i}`}
              type="hidden"
              name={`itemsToRemove[${i}]`}
              value={id}
            />
          ))}
        </ValidatedForm>
      ) : !items.length ? (
        <p className="m-0">No Items</p>
      ) : (
        <div className="flex flex-col">
          {sortItems(items).map((item) => (
            <p key={item.id} className="m-0">
              {item.cost} CR - {item.name} ({'I'.repeat(item.tier)})
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

export default ItemManager
