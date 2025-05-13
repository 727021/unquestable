import type { LoaderData as GameLoaderData } from '~/routes/_app.games.$game'
import type { LoaderData } from '~/routes/_app.games.$game.rebels'
import EditButton from '../EditButton'
import type { Reducer } from 'react'
import { useCallback, useEffect, useId, useReducer } from 'react'
import { useFetcher } from 'react-router'
import type { ActionData } from '~/routes/_app.games.$game.rebels.rewards'
import { rewardSchema } from '~/routes/_app.games.$game.rebels.rewards'
import SubmitButton from '../SubmitButton'
import { ValidatedForm } from '@rvf/react-router'
import { XCircleIcon } from '@heroicons/react/24/outline'
import { PlusIcon } from '@heroicons/react/24/solid'

type RewardId = LoaderData['rewards'][0]['id']

type State = {
  editing: boolean
  rewardsToAdd: RewardId[]
  rewardsToRemove: RewardId[]
  chosenReward: RewardId
}

type Action =
  | { type: 'TOGGLE_EDITING' | 'STOP_EDITING' }
  | {
      type: 'ADD_REWARD' | 'REMOVE_REWARD' | 'CHOOSE_REWARD'
      rewardId: RewardId
    }

const initialState: State = {
  editing: false,
  rewardsToAdd: [],
  rewardsToRemove: [],
  chosenReward: -1
}

type Props = {
  rebel: GameLoaderData['game']['rebelPlayers'][0]
  allRewards: LoaderData['rewards']
  formAction?: string
}

const RebelRewardManager = ({ rebel, allRewards, formAction }: Props) => {
  const reducer: Reducer<State, Action> = useCallback(
    (state, action) => {
      switch (action.type) {
        case 'TOGGLE_EDITING':
          return { ...initialState, editing: !state.editing }
        case 'STOP_EDITING':
          return { ...initialState, editing: false }
        case 'ADD_REWARD':
          if (rebel.rewards.some((r) => r.id === action.rewardId)) {
            return {
              ...state,
              rewardsToAdd: state.rewardsToAdd.filter(
                (id) => id !== action.rewardId
              ),
              rewardsToRemove: state.rewardsToRemove.filter(
                (id) => id !== action.rewardId
              ),
              chosenReward: initialState.chosenReward
            }
          }
          return {
            ...state,
            rewardsToAdd: [...state.rewardsToAdd, action.rewardId],
            rewardsToRemove: state.rewardsToRemove.filter(
              (id) => id !== action.rewardId
            ),
            chosenReward: initialState.chosenReward
          }
        case 'REMOVE_REWARD':
          if (!rebel.rewards.some((r) => r.id === action.rewardId)) {
            return {
              ...state,
              rewardsToRemove: state.rewardsToRemove.filter(
                (id) => id !== action.rewardId
              ),
              rewardsToAdd: state.rewardsToAdd.filter(
                (id) => id !== action.rewardId
              ),
              chosenReward: initialState.chosenReward
            }
          }
          return {
            ...state,
            rewardsToRemove: [...state.rewardsToRemove, action.rewardId],
            rewardsToAdd: state.rewardsToAdd.filter(
              (id) => id !== action.rewardId
            ),
            chosenReward: initialState.chosenReward
          }
        case 'CHOOSE_REWARD':
          return { ...state, chosenReward: action.rewardId }
        default:
          return state
      }
    },
    [rebel.rewards]
  )

  const [rewardState, updateRewards] = useReducer(reducer, initialState)

  const fetcher = useFetcher<ActionData>()

  const formId = useId()

  useEffect(() => {
    if (fetcher.data?.success && fetcher.state === 'idle') {
      updateRewards({ type: 'STOP_EDITING' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher?.state])

  const rewardsToShow = [
    ...rebel.rewards.filter((r) => !rewardState.rewardsToRemove.includes(r.id)),
    ...allRewards.filter((r) => rewardState.rewardsToAdd.includes(r.id))
  ]

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center w-full">
        <h3 className="m-0">Rewards</h3>
        <div className="flex gap-2">
          {rewardState.editing && (
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
            active={rewardState.editing}
            onClick={() => updateRewards({ type: 'TOGGLE_EDITING' })}
            hideLabel
            disabled={
              fetcher.state === 'loading' || fetcher.state === 'submitting'
            }
          />
        </div>
      </div>
      {rewardState.editing ? (
        <ValidatedForm
          schema={rewardSchema}
          method="POST"
          className="flex flex-1 flex-col gap-2"
          fetcher={fetcher}
          action={formAction}
          id={formId}
          defaultValues={{
            rewardsToAdd: [],
            rewardsToRemove: [],
            id: rebel.id
          }}
        >
          <div className="flex flex-col items-start w-fit">
            {!rewardsToShow.length ? (
              <p className="m-0">No Rewards</p>
            ) : (
              rewardsToShow.map((reward) => (
                <div key={reward.id} className="flex gap-1 items-center">
                  <p className="m-0">{reward.name}</p>
                  <button
                    className="btn btn-xs btn-circle btn-ghost tooltip"
                    data-tip="Remove"
                    type="button"
                    onClick={() =>
                      updateRewards({
                        type: 'REMOVE_REWARD',
                        rewardId: reward.id
                      })
                    }
                  >
                    <XCircleIcon className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="join">
            <select
              className="join-item select select-bordered"
              value={rewardState.chosenReward}
              onChange={(e) =>
                updateRewards({
                  type: 'CHOOSE_REWARD',
                  rewardId: parseInt(e.target.value, 10)
                })
              }
            >
              <option value={-1} disabled>
                Choose a Reward
              </option>
              {allRewards
                .filter(
                  (reward) => !rewardsToShow.some((r) => r.id === reward.id)
                )
                .map((reward) => (
                  <option key={reward.id} value={reward.id}>
                    {reward.name}
                  </option>
                ))}
            </select>
            <button
              className="join-item btn btn-outline"
              type="button"
              onClick={() =>
                rewardState.chosenReward > -1 &&
                updateRewards({
                  type: 'ADD_REWARD',
                  rewardId: rewardState.chosenReward
                })
              }
              disabled={rewardState.chosenReward === -1}
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
          <input type="hidden" name="id" value={rebel.id} />
          {rewardState.rewardsToAdd.map((id, i) => (
            <input
              key={`rewardsToAdd-${i}`}
              type="hidden"
              name={`rewardsToAdd[${i}]`}
              value={id}
            />
          ))}
          {rewardState.rewardsToRemove.map((id, i) => (
            <input
              key={`rewardsToRemove-${i}`}
              type="hidden"
              name={`rewardsToRemove[${i}]`}
              value={id}
            />
          ))}
        </ValidatedForm>
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
