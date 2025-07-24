import type { LoaderData as GameLoaderData } from '~/routes/_app.games.$game'
import EditButton from '../EditButton'
import type { Reducer } from 'react'
import { useCallback, useEffect, useId, useReducer, useState } from 'react'
import { useFetcher } from 'react-router'
import type { ActionData } from '~/routes/_app.games.$game.rebels.class'
import { classSchema } from '~/routes/_app.games.$game.rebels.class'
import SubmitButton from '../SubmitButton'
import { useForm } from '@rvf/react-router'

type Props = {
  rebel: GameLoaderData['game']['rebelPlayers'][0]
  formAction?: string
}

const RebelClassManager = ({ rebel, formAction }: Props) => {
  const fetcher = useFetcher<ActionData>()

  const [editing, setEditing] = useState(false)

  const formId = useId()
  const form = useForm({
    id: formId,
    schema: classSchema,
    method: 'POST',
    fetcher,
    action: formAction,
    defaultValues: {
      id: rebel.id,
      classCards: rebel.classCards.map((c) => c.id)
    }
  })

  const cancel = () => {
    setEditing(false)
    form.resetForm({
      id: rebel.id,
      classCards: rebel.classCards.map((c) => c.id)
    })
  }

  const toggle = () => {
    setEditing((prev) => !prev)
    form.resetForm({
      id: rebel.id,
      classCards: rebel.classCards.map((c) => c.id)
    })
  }

  const add = (cardId: number) => {
    form.setValue('classCards', [...(form.value('classCards') ?? []), cardId])
  }

  const remove = (cardId: number) => {
    form.setValue(
      'classCards',
      form.value('classCards')?.filter((id) => id !== cardId)
    )
  }

  useEffect(() => {
    if (fetcher.data?.success && fetcher.state === 'idle') {
      cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher?.state])

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center w-full">
        <h3 className="m-0">Class</h3>
        <div className="flex gap-2">
          {editing && (
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
            active={editing}
            onClick={() => toggle()}
            disabled={
              fetcher.state === 'loading' || fetcher.state === 'submitting'
            }
            hideLabel
          />
        </div>
      </div>
      {editing ? (
        <form
          {...form.getFormProps()}
          className="flex flex-1 justify-between items-end"
        >
          {form.renderFormIdInput()}
          <fieldset className="fieldset items-start w-fit py-2 self-start">
            {rebel.hero.class?.cards.map((card) => (
              <label key={card.id} className="label gap-2 flex py-0.5">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-primary"
                  checked={form.value('classCards')?.includes(card.id)}
                  onChange={(e) =>
                    e.target.checked ? add(card.id) : remove(card.id)
                  }
                />
                <span className="text-base-content">
                  {card.cost} XP - {card.name}
                </span>
              </label>
            ))}
          </fieldset>
          <input {...form.getHiddenInputProps('id')} />
          {form.value('classCards')?.map((_, i) => (
            <input {...form.getHiddenInputProps(`classCards[${i}]`)} />
          ))}
        </form>
      ) : (
        <fieldset className="fieldset items-start w-fit py-2">
          {rebel.hero.class?.cards.map((card) => (
            <label
              key={card.id}
              className="label cursor-default! gap-2 flex py-0.5 text-base-content"
            >
              <input
                type="checkbox"
                className="checkbox checkbox-sm cursor-default"
                checked={rebel.classCards.some((c) => c.id === card.id)}
                readOnly
              />
              <span className="cursor-default">
                {card.cost} XP - {card.name}
              </span>
            </label>
          ))}
        </fieldset>
      )}
    </div>
  )
}

export default RebelClassManager
