import type { LoaderData as GameLoaderData } from '~/routes/_app.games.$game'
import type { LoaderData } from '~/routes/_app.games.$game.rebels'
import EditButton from '../EditButton'
import clsx from 'clsx'
import { useEffect, useId, useState } from 'react'
import { useFetcher } from 'react-router'
import type { ActionData } from '~/routes/_app.games.$game.rebels.allies'
import { allySchema } from '~/routes/_app.games.$game.rebels.allies'
import SubmitButton from '../SubmitButton'
import { useForm } from '@rvf/react-router'
import { XCircleIcon } from '@heroicons/react/24/outline'
import { PlusIcon } from '@heroicons/react/24/solid'
import { Troop } from '@prisma/client'

type Props = {
  allies: GameLoaderData['game']['allies']
  allAllies: LoaderData['troops']
  formAction?: string
}

const AllyManager = ({ allies, allAllies, formAction }: Props) => {
  const fetcher = useFetcher<ActionData>()

  const [editing, setEditing] = useState(false)

  const formId = useId()
  const form = useForm({
    id: formId,
    schema: allySchema,
    fetcher,
    action: formAction,
    method: 'POST',
    defaultValues: {
      allies: allies.map((ally) => ally.id)
    }
  })

  const cancel = () => {
    setEditing(false)
    form.resetForm({ allies: allies.map((ally) => ally.id) })
  }

  const toggle = () => {
    setEditing((prev) => !prev)
    form.resetForm({ allies: allies.map((ally) => ally.id) })
  }

  const [ally, setAlly] = useState(-1)

  const [availableAllies, ownedAllies] = allAllies.reduce<[Troop[], Troop[]]>(
    ([available, owned], ally) => {
      if (form.value('allies')?.includes(ally.id)) {
        owned.push(ally)
      } else {
        available.push(ally)
      }
      return [available, owned]
    },
    [[], []]
  )

  const add = () => {
    if (!availableAllies.some((a) => a.id === ally)) return
    form.setValue('allies', [...(form.value('allies') ?? []), ally])
    setAlly(-1)
  }

  const remove = (allyId: number) => {
    form.setValue(
      'allies',
      form.value('allies')?.filter((id) => id !== allyId)
    )
    setAlly(allyId)
  }

  useEffect(() => {
    if (fetcher.data?.success && fetcher.state === 'idle') {
      cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.state])

  return (
    <div className="flex flex-col flex-1 px-2 py-1 gap-2 border border-gray-400 rounded-xs">
      <div className="flex justify-between items-center w-full">
        <h3 className="m-0">Allies</h3>
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
        <form {...form.getFormProps()} className="flex flex-1 flex-col gap-2">
          {form.renderFormIdInput()}
          <div className="flex flex-col items-start w-fit">
            {!ownedAllies.length ? (
              <p className="m-0">No Allies</p>
            ) : (
              ownedAllies.map((ally) => (
                <div key={ally.id} className="flex gap-1 items-center">
                  <p className={clsx('m-0', ally.elite && 'text-red-600')}>
                    {ally.name}
                  </p>
                  <button
                    className="btn btn-xs btn-circle btn-ghost tooltip"
                    data-tip="Remove"
                    type="button"
                    onClick={() => remove(ally.id)}
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="join">
            <select
              className="join-item select"
              value={ally}
              onChange={(e) => setAlly(parseInt(e.target.value, 10))}
            >
              <option value="-1" disabled>
                Choose an Ally
              </option>
              {availableAllies.map((ally) => (
                <option key={ally.id} value={ally.id}>
                  {ally.unique && '* '}
                  {ally.name}
                  {ally.elite && ' (Elite)'}
                </option>
              ))}
            </select>
            <button
              className="join-item btn btn-outline border-l-2"
              type="button"
              onClick={() => add()}
              disabled={ally === -1}
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
          {form.value('allies')?.map((_, i) => (
            <input {...form.getHiddenInputProps(`allies[${i}]`)} />
          ))}
        </form>
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
