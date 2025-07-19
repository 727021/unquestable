import type { LoaderData as GameLoaderData } from '~/routes/_app.games.$game'
import type { LoaderData } from '~/routes/_app.games.$game.rebels'
import EditButton from '../EditButton'
import { useEffect, useId, useState } from 'react'
import { useFetcher } from 'react-router'
import type { ActionData } from '~/routes/_app.games.$game.rebels.rewards'
import { rewardSchema } from '~/routes/_app.games.$game.rebels.rewards'
import SubmitButton from '../SubmitButton'
import { useForm } from '@rvf/react-router'
import { XCircleIcon } from '@heroicons/react/24/outline'
import { PlusIcon } from '@heroicons/react/24/solid'

type Reward = LoaderData['rewards'][0]

type Props = {
  rebel: GameLoaderData['game']['rebelPlayers'][0]
  allRewards: LoaderData['rewards']
  formAction?: string
}

const RebelRewardManager = ({ rebel, allRewards, formAction }: Props) => {
  const fetcher = useFetcher<ActionData>()

  const [editing, setEditing] = useState(false)

  const formId = useId()
  const form = useForm({
    id: formId,
    schema: rewardSchema,
    method: 'POST',
    fetcher,
    action: formAction,
    defaultValues: {
      id: rebel.id,
      rewards: rebel.rewards.map((r) => r.id)
    }
  })

  const cancel = () => {
    setEditing(false)
    form.resetForm({ id: rebel.id, rewards: rebel.rewards.map((r) => r.id) })
  }

  const toggle = () => {
    setEditing((prev) => !prev)
    form.resetForm({ id: rebel.id, rewards: rebel.rewards.map((r) => r.id) })
  }

  const [reward, setReward] = useState(-1)

  const [availableRewards, ownedRewards] = allRewards.reduce<
    [Reward[], Reward[]]
  >(
    ([available, owned], reward) => {
      if (form.value('rewards')?.includes(reward.id)) {
        owned.push(reward)
      } else {
        available.push(reward)
      }
      return [available, owned]
    },
    [[], []]
  )

  const add = () => {
    if (!availableRewards.some((r) => r.id === reward)) {
      return
    }
    form.setValue('rewards', [...(form.value('rewards') ?? []), reward])
    setReward(-1)
  }

  const remove = (rewardId: number) => {
    form.setValue(
      'rewards',
      form.value('rewards')?.filter((id) => id !== rewardId)
    )
    setReward(rewardId)
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
        <h3 className="m-0">Rewards</h3>
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
            {!form.value('rewards')?.length ? (
              <p className="m-0">No Rewards</p>
            ) : (
              ownedRewards.map((reward) => (
                <div key={reward.id} className="flex gap-1 items-center">
                  <p className="m-0">{reward.name}</p>
                  <button
                    className="btn btn-xs btn-circle btn-ghost tooltip"
                    data-tip="Remove"
                    type="button"
                    onClick={() => remove(reward.id)}
                  >
                    <XCircleIcon className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="join">
            <select
              className="join-item select"
              value={reward}
              onChange={(e) => setReward(parseInt(e.target.value, 10))}
            >
              <option value={-1}>Choose a Reward</option>
              {availableRewards.map((reward) => (
                <option key={reward.id} value={reward.id}>
                  {reward.name}
                </option>
              ))}
            </select>
            <button
              className="join-item btn btn-outline border-l-2"
              type="button"
              onClick={() => add()}
              disabled={reward === -1}
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
          <input {...form.getHiddenInputProps('id')} />
          {form
            .value('rewards')
            ?.map((_, i) => (
              <input {...form.getHiddenInputProps(`rewards[${i}]`)} />
            ))}
        </form>
      ) : !rebel.rewards.length ? (
        <p className="m-0">No Rewards</p>
      ) : (
        <div className="flex flex-col items-start w-fit">
          {rebel.rewards.map((reward) => (
            <p className="m-0" key={reward.id}>
              {reward.name}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

export default RebelRewardManager
