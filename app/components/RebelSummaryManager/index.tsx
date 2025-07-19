import { useEffect, useId, useState } from 'react'
import EditButton from '~/components/EditButton'
import type { LoaderData as GameLoaderData } from '~/routes/_app.games.$game'
import SubmitButton from '../SubmitButton'
import { useFetcher } from 'react-router'
import type { ActionData } from '~/routes/_app.games.$game.rebels.summary'
import { summarySchema } from '~/routes/_app.games.$game.rebels.summary'
import { useForm } from '@rvf/react-router'
import TextInput from '../TextInput'

type Props = {
  rebel: GameLoaderData['game']['rebelPlayers'][0]
  formAction?: string
}

const RebelSummaryManager = ({ rebel, formAction }: Props) => {
  const fetcher = useFetcher<ActionData>()

  const [editing, setEditing] = useState(false)

  const formId = useId()
  const form = useForm({
    id: formId,
    schema: summarySchema,
    method: 'POST',
    fetcher,
    action: formAction,
    defaultValues: {
      id: rebel.id,
      name: rebel.name ?? '',
      xp: rebel.xp
    }
  })

  const cancel = () => {
    setEditing(false)
    form.resetForm({ id: rebel.id, name: rebel.name ?? '', xp: rebel.xp })
  }

  const toggle = () => {
    setEditing((prev) => !prev)
    form.resetForm({ id: rebel.id, name: rebel.name ?? '', xp: rebel.xp })
  }

  useEffect(() => {
    if (fetcher?.data?.success && fetcher.state === 'idle') {
      cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher?.state])

  return (
    <div className="flex flex-col">
      <div className="flex gap-2 justify-between items-center">
        <h2 className="m-0">{rebel.hero.name}</h2>
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
            hideLabel
            disabled={
              fetcher?.state === 'loading' || fetcher?.state === 'submitting'
            }
          />
        </div>
      </div>
      {editing ? (
        <form
          {...form.getFormProps()}
          className="flex flex-1 gap-2 items-start"
        >
          {form.renderFormIdInput()}
          <div className="flex flex-1 flex-wrap gap-2 justify-between items-center">
            <input {...form.getHiddenInputProps('id')} />
            <TextInput
              formApi={form}
              name="name"
              label={<span className="font-bold">Name:</span>}
              inline
            />
            <TextInput
              formApi={form}
              type="number"
              name="xp"
              label={<span className="font-bold">XP:</span>}
              inline
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
