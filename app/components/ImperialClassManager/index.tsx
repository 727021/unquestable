import { useFetcher } from 'react-router'
import type { LoaderData } from '~/routes/_app.games.$game'
import EditButton from '~/components/EditButton'
import { useEffect, useId, useState } from 'react'
import { useForm } from '@rvf/react-router'
import { ActionData, classSchema } from '~/routes/_app.games.$game.empire.class'
import SubmitButton from '~/components/SubmitButton'

type Props = {
  imperialPlayer: NonNullable<LoaderData['game']['imperialPlayer']>
  formAction?: string
}

const ImperialClassManager = ({ imperialPlayer, formAction }: Props) => {
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
      cards: imperialPlayer.classCards.map((c) => c.id)
    }
  })

  const cancel = () => {
    setEditing(false)
    form.resetForm({
      cards: imperialPlayer.classCards.map((c) => c.id)
    })
  }

  const toggle = () => {
    setEditing((prev) => !prev)
    form.resetForm({
      cards: imperialPlayer.classCards.map((c) => c.id)
    })
  }

  const add = (cardId: number) => {
    form.setValue('cards', [...(form.value('cards') ?? []), cardId])
  }

  const remove = (cardId: number) => {
    form.setValue(
      'cards',
      form.value('cards')?.filter((id) => id !== cardId)
    )
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
        <h2 className="m-0">{imperialPlayer.class.name}</h2>
        <EditButton
          active={editing}
          onClick={() => toggle()}
          disabled={
            fetcher?.state === 'loading' || fetcher?.state === 'submitting'
          }
        />
      </div>
      {editing ? (
        <form
          {...form.getFormProps()}
          className="flex flex-1 justify-between items-end"
        >
          {form.renderFormIdInput()}
          <fieldset className="fieldset items-start w-fit py-2 self-start">
            {imperialPlayer.class.cards.map((card) => (
              <label key={card.id} className="label gap-2 flex py-1">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-primary"
                  checked={form.value('cards')?.includes(card.id)}
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
          <SubmitButton
            className="btn btn-primary btn-outline"
            fetcher={fetcher}
            formApi={form}
          >
            Save
          </SubmitButton>
          {form.value('cards')?.map((_, i) => (
            <input {...form.getHiddenInputProps(`cards[${i}]`)} />
          ))}
        </form>
      ) : (
        <fieldset className="fieldset items-start w-fit py-2">
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
              <span className="text-base-content">
                {card.cost} XP - {card.name}
              </span>
            </label>
          ))}
        </fieldset>
      )}
    </div>
  )
}

export default ImperialClassManager
