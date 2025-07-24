import { useFetcher } from 'react-router'
import { useEffect, useId, useState } from 'react'
import type { LoaderData as GameLoaderData } from '~/routes/_app.games.$game'
import type { LoaderData } from '~/routes/_app.games.$game.empire'
import EditButton from '../EditButton'
import { useForm } from '@rvf/react-router'
import {
  ActionData,
  rewardSchema
} from '~/routes/_app.games.$game.empire.rewards'
import SubmitButton from '../SubmitButton'
import { PlusIcon } from '@heroicons/react/24/solid'
import { XCircleIcon } from '@heroicons/react/24/outline'
import { Reward } from '@prisma/client'

type Props = {
  imperialPlayer: NonNullable<GameLoaderData['game']['imperialPlayer']>
  allRewards: LoaderData['rewards']
  formAction?: string
}

const ImperialRewardManager = ({
  imperialPlayer,
  allRewards,
  formAction
}: Props) => {
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
      rewards: imperialPlayer.rewards.map((r) => r.id).toSorted((a, b) => a - b)
    }
  })

  const cancel = () => {
    setEditing(false)
    form.resetForm({ rewards: imperialPlayer.rewards.map((r) => r.id) })
    setReward(-1)
  }

  const toggle = () => {
    setEditing((prev) => !prev)
    if (!editing) {
      form.resetForm({ rewards: imperialPlayer.rewards.map((r) => r.id) })
      setReward(-1)
    }
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
      return [
        available.toSorted((a, b) => a.name.localeCompare(b.name)),
        owned.toSorted((a, b) => a.name.localeCompare(b.name))
      ]
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
    if (fetcher?.data?.success && fetcher.state === 'idle') {
      cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher?.state])

  return (
    <div className="flex flex-col flex-1 px-2 py-1 gap-1 border border-gray-400 rounded-xs">
      <div className="flex justify-between items-center w-full">
        <h2 className="m-0">Rewards</h2>
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
            disabled={
              fetcher.state === 'loading' || fetcher.state === 'submitting'
            }
            hideLabel
          />
        </div>
      </div>
      {editing ? (
        <form {...form.getFormProps()} className="flex flex-1 flex-col gap-2">
          {form.renderFormIdInput()}
          <div className="flex flex-col items-start w-fit">
            {ownedRewards.length === 0 ? (
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
          {/* <div className="flex justify-between items-end flex-1"> */}
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
          {form.value('rewards')?.map((_, i) => (
            <input {...form.getHiddenInputProps(`rewards[${i}]`)} />
          ))}
          {/* </div> */}
        </form>
      ) : !ownedRewards.length ? (
        <p className="m-0">No Rewards</p>
      ) : (
        <div className="flex flex-col items-start w-fit">
          {ownedRewards.map((reward) => (
            <p className="m-0" key={reward.id}>
              {reward.name}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImperialRewardManager
