import { useFetcher } from 'react-router'
import type { LoaderData } from '~/routes/_app.games.$game'
import EditButton from '~/components/EditButton'
import { useEffect, useId, useState } from 'react'
import { useForm } from '@rvf/react-router'
import { summarySchema } from '~/routes/_app.games.$game.empire.summary'
import type { ActionData } from '~/routes/_app.games.$game.empire.summary'
import SubmitButton from '~/components/SubmitButton'
import TextInput from '~/components/TextInput'

type Props = {
  imperialPlayer: NonNullable<LoaderData['game']['imperialPlayer']>
  formAction?: string
}

const ImperialSummaryManager = ({ imperialPlayer, formAction }: Props) => {
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
      name: imperialPlayer.name ?? '',
      xp: imperialPlayer.xp,
      influence: imperialPlayer.influence
    }
  })

  const cancel = () => {
    setEditing(false)
    form.resetForm({
      name: imperialPlayer.name ?? '',
      xp: imperialPlayer.xp,
      influence: imperialPlayer.influence
    })
  }

  const toggle = () => {
    setEditing((prev) => !prev)
    form.resetForm({
      name: imperialPlayer.name ?? '',
      xp: imperialPlayer.xp,
      influence: imperialPlayer.influence
    })
  }

  useEffect(() => {
    if (fetcher?.data?.success && fetcher.state === 'idle') {
      cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher?.state])

  return (
    <div className="flex flex-1 px-2 py-1 gap-2 border border-gray-400 rounded-xs items-start">
      {editing ? (
        <form
          {...form.getFormProps()}
          className="flex flex-1 gap-2 items-start"
        >
          {form.renderFormIdInput()}
          <div className="flex flex-1 flex-wrap gap-2 justify-between items-center">
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
            <TextInput
              formApi={form}
              type="number"
              name="influence"
              label={<span className="font-bold">Influence:</span>}
              inline
              min={0}
            />
          </div>
          <SubmitButton
            className="btn btn-sm btn-primary btn-outline"
            fetcher={fetcher}
            formApi={form}
          >
            Save
          </SubmitButton>
        </form>
      ) : (
        <div className="flex flex-1 gap-2 justify-between items-center my-auto">
          <div className="min-w-4">
            <span className="font-bold">Name:</span> {imperialPlayer.name}
          </div>
          <div>
            <span className="font-bold">XP:</span> {imperialPlayer.xp}
          </div>
          <div className="flex gap-2 items-center">
            <span>
              <span className="font-bold">Influence:</span>{' '}
              {imperialPlayer.influence}
            </span>
          </div>
        </div>
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
  )
}

export default ImperialSummaryManager
