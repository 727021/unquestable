import { useFetcher } from 'react-router'
import clsx from 'clsx'
import { useEffect, useId, useState } from 'react'
import type { LoaderData as GameLoaderData } from '~/routes/_app.games.$game'
import type { LoaderData } from '~/routes/_app.games.$game.empire'
import EditButton from '../EditButton'
import { useForm } from '@rvf/react-router'
import {
  ActionData,
  villainSchema
} from '~/routes/_app.games.$game.empire.villains'
import { XCircleIcon } from '@heroicons/react/24/outline'
import { PlusIcon } from '@heroicons/react/24/solid'
import SubmitButton from '../SubmitButton'
import { Troop } from '@prisma/client'

type Props = {
  imperialPlayer: NonNullable<GameLoaderData['game']['imperialPlayer']>
  allVillains: LoaderData['troops']
  formAction?: string
}

const VillainManager = ({ imperialPlayer, allVillains, formAction }: Props) => {
  const fetcher = useFetcher<ActionData>()

  const [editing, setEditing] = useState(false)

  const formId = useId()
  const form = useForm({
    id: formId,
    schema: villainSchema,
    method: 'POST',
    fetcher,
    action: formAction,
    defaultValues: {
      villains: imperialPlayer.villains.map((v) => v.id)
    }
  })

  const cancel = () => {
    setEditing(false)
    form.resetForm({ villains: imperialPlayer.villains.map((v) => v.id) })
  }

  const toggle = () => {
    setEditing((prev) => !prev)
    if (!editing) {
      form.resetForm({ villains: imperialPlayer.villains.map((v) => v.id) })
    }
  }

  const [villain, setVillain] = useState(-1)

  const [availableVillains, ownedVillains] = allVillains.reduce<
    [Troop[], Troop[]]
  >(
    ([available, owned], villain) => {
      if (form.value('villains')?.includes(villain.id)) {
        owned.push(villain)
      } else {
        available.push(villain)
      }
      return [available, owned]
    },
    [[], []]
  )

  const add = () => {
    if (!availableVillains.some((v) => v.id === villain)) return
    form.setValue('villains', [...(form.value('villains') ?? []), villain])
    setVillain(-1)
  }

  const remove = (villainId: number) => {
    form.setValue(
      'villains',
      form.value('villains')?.filter((id) => id !== villainId)
    )
    setVillain(villainId)
  }

  useEffect(() => {
    if (fetcher?.data?.success && fetcher.state === 'idle') {
      cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher?.state])

  return (
    <div className="flex flex-col flex-1 px-2 pb-1 border border-gray-400 rounded-xs">
      <div className="flex justify-between items-center w-full">
        <h2 className="m-0">Villains</h2>
        <EditButton
          active={editing}
          onClick={() => toggle()}
          disabled={
            fetcher?.state === 'loading' || fetcher?.state === 'submitting'
          }
        />
      </div>
      {editing ? (
        <form {...form.getFormProps()} className="flex flex-1 flex-col gap-2">
          {form.renderFormIdInput()}
          <div className="flex flex-col items-start w-fit py-2">
            {ownedVillains.length === 0 ? (
              <p className="m-0">No Villains</p>
            ) : (
              ownedVillains.map((villain) => (
                <div key={villain.id} className="flex gap-1 items-center">
                  <p className={clsx('m-0', villain.elite && 'text-red-600')}>
                    {villain.name}
                  </p>
                  <button
                    className="btn btn-xs btn-circle btn-ghost tooltip"
                    data-tip="Remove"
                    type="button"
                    onClick={() => remove(villain.id)}
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="flex justify-between items-end flex-1">
            <div className="join">
              <select
                className="join-item select"
                value={villain}
                onChange={(e) => setVillain(parseInt(e.target.value, 10))}
              >
                <option value="-1" disabled>
                  Choose a Villain
                </option>
                {availableVillains.map((villain) => (
                  <option key={villain.id} value={villain.id}>
                    {villain.unique && '* '}
                    {villain.name}
                    {villain.elite && ' (Elite)'}
                  </option>
                ))}
              </select>
              <button
                className="join-item btn btn-outline border-l-2"
                type="button"
                onClick={() => add()}
                disabled={villain === -1}
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
            <SubmitButton
              className="btn btn-primary btn-outline"
              fetcher={fetcher}
              formApi={form}
            >
              Save
            </SubmitButton>
            {form.value('villains')?.map((_, i) => (
              <input {...form.getHiddenInputProps(`villains[${i}]`)} />
            ))}
          </div>
        </form>
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
