import type { LoaderData as GameLoaderData } from '~/routes/_app.games.$game'
import type { LoaderData } from '~/routes/_app.games.$game.rebels'
import EditButton from '../EditButton'
import { sortItems } from '~/utils/sortItems'
import { useEffect, useId, useState } from 'react'
import { useFetcher } from 'react-router'
import type { ActionData } from '~/routes/_app.games.$game.rebels.items'
import { itemSchema } from '~/routes/_app.games.$game.rebels.items'
import SubmitButton from '../SubmitButton'
import TextInput from '../TextInput'
import { useForm } from '@rvf/react-router'
import { XCircleIcon } from '@heroicons/react/24/outline'
import { PlusIcon } from '@heroicons/react/24/solid'
import { Item } from '@prisma/client'

type Props = {
  items: GameLoaderData['game']['items']
  allItems: LoaderData['items']
  credits: GameLoaderData['game']['credits']
  formAction?: string
}

const ItemManager = ({ items, allItems, credits, formAction }: Props) => {
  const fetcher = useFetcher<ActionData>()

  const [editing, setEditing] = useState(false)

  const formId = useId()
  const form = useForm({
    id: formId,
    schema: itemSchema,
    method: 'POST',
    fetcher,
    action: formAction,
    defaultValues: {
      credits,
      items: items.map((i) => i.id)
    }
  })

  const cancel = () => {
    setEditing(false)
    form.resetForm({
      credits,
      items: items.map((i) => i.id)
    })
  }

  const toggle = () => {
    setEditing((prev) => !prev)
    form.resetForm({
      credits,
      items: items.map((i) => i.id)
    })
  }

  const [item, setItem] = useState(-1)

  const [availableItems, ownedItems] = allItems.reduce<[Item[], Item[]]>(
    ([available, owned], item) => {
      if (form.value('items')?.includes(item.id)) {
        owned.push(item)
      } else {
        available.push(item)
      }
      return [available, owned]
    },
    [[], []]
  )

  const add = () => {
    if (!availableItems.some((i) => i.id === item)) {
      return
    }
    form.setValue('items', [...(form.value('items') ?? []), item])
    setItem(-1)
  }

  const remove = (itemId: number) => {
    form.setValue(
      'items',
      form.value('items')?.filter((id) => id !== itemId)
    )
    setItem(itemId)
  }

  useEffect(() => {
    if (fetcher.data?.success && fetcher.state === 'idle') {
      cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.state])

  return (
    <div className="flex flex-col flex-1 px-2 py-1 gap-2 border border-gray-400 rounded">
      <div className="flex flex-col">
        <div className="flex justify-between items-center w-full">
          <h3 className="m-0">Items</h3>
          <div className="flex gap-2">
            {editing && (
              <SubmitButton
                className="btn btn-sm btn-primary btn-outline"
                formApi={form}
                fetcher={fetcher}
                disabled={
                  fetcher.state === 'loading' || fetcher.state === 'submitting'
                }
              >
                Save
              </SubmitButton>
            )}
            <EditButton
              active={editing}
              onClick={() => toggle()}
              hideLabel
              disabled={
                fetcher.state === 'loading' || fetcher.state === 'submitting'
              }
            />
          </div>
        </div>
        {editing ? (
          <TextInput
            type="number"
            name="credits"
            formApi={form}
            form={formId}
            label={<span className="font-bold">Credits:</span>}
            inline
            step="25"
          />
        ) : (
          <div>
            <span className="font-bold">Credits:</span> {credits}
          </div>
        )}
      </div>
      <hr className="border-gray-400 my-0" />
      {editing ? (
        <form {...form.getFormProps()} className="flex flex-1 flex-col gap-2">
          {form.renderFormIdInput()}
          <div className="flex flex-col">
            {!ownedItems.length ? (
              <p className="m-0">No Items</p>
            ) : (
              sortItems(ownedItems).map((item) => (
                <div key={item.id} className="flex gap-1 items-center">
                  <p className="m-0">
                    {item.cost} CR - {item.name} ({'I'.repeat(item.tier)})
                  </p>
                  <button
                    className="btn btn-xs btn-circle btn-ghost tooltip"
                    data-tip="Remove"
                    type="button"
                    onClick={() => remove(item.id)}
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
              value={item}
              onChange={(e) => setItem(parseInt(e.target.value, 10))}
            >
              <option value="-1" disabled>
                Choose an Item
              </option>
              {sortItems(availableItems).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.cost} CR - {item.name} ({'I'.repeat(item.tier)})
                </option>
              ))}
            </select>
            <button
              className="join-item btn btn-outline"
              type="button"
              onClick={() => add()}
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
          {form
            .value('items')
            ?.map((_, i) => (
              <input {...form.getHiddenInputProps(`items[${i}]`)} />
            ))}
        </form>
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
