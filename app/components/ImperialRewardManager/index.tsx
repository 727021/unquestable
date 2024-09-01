import type { FetcherWithComponents } from '@remix-run/react'
import type { Reducer } from 'react'
import { useCallback, useEffect, useReducer } from 'react'
import type { LoaderData as GameLoaderData } from '~/routes/_app.games.$game'
import type { LoaderData } from '~/routes/_app.games.$game.empire'
import EditButton from '../EditButton'
import { ValidatedForm } from 'remix-validated-form'
import { rewardValidator } from '~/routes/_app.games.$game.empire.rewards'
import SubmitButton from '../SubmitButton'
import { PlusIcon } from '@heroicons/react/24/solid'
import { XCircleIcon } from '@heroicons/react/24/outline'

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
  imperialPlayer: NonNullable<GameLoaderData['game']['imperialPlayer']>
  allRewards: LoaderData['rewards']
  fetcher?: FetcherWithComponents<any>
  formAction?: string
}

const ImperialRewardManager = ({
  imperialPlayer,
  allRewards,
  fetcher,
  formAction
}: Props) => {
  const reducer: Reducer<State, Action> = useCallback(
    (state, action) => {
      switch (action.type) {
        case 'TOGGLE_EDITING':
          return { ...initialState, editing: !state.editing }
        case 'STOP_EDITING':
          return { ...initialState, editing: false }
        case 'ADD_REWARD':
          if (imperialPlayer.rewards.some((r) => r.id === action.rewardId)) {
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
          if (!imperialPlayer.rewards.some((r) => r.id === action.rewardId)) {
            return {
              ...state,
              rewardsToAdd: state.rewardsToAdd.filter(
                (id) => id !== action.rewardId
              ),
              rewardsToRemove: state.rewardsToRemove.filter(
                (id) => id !== action.rewardId
              ),
              chosenReward: action.rewardId
            }
          }
          return {
            ...state,
            rewardsToAdd: state.rewardsToAdd.filter(
              (id) => id !== action.rewardId
            ),
            rewardsToRemove: [...state.rewardsToRemove, action.rewardId],
            chosenReward: action.rewardId
          }
        case 'CHOOSE_REWARD':
          return { ...state, chosenReward: action.rewardId }
      }
    },
    [imperialPlayer.rewards]
  )

  const [rewardState, updateRewards] = useReducer(reducer, initialState)

  useEffect(() => {
    if (fetcher?.data?.success && fetcher.state === 'idle') {
      updateRewards({ type: 'STOP_EDITING' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher?.state])

  const rewardsToShow = [
    ...imperialPlayer.rewards.filter(
      (r) => !rewardState.rewardsToRemove.includes(r.id)
    ),
    ...allRewards.filter((r) => rewardState.rewardsToAdd.includes(r.id))
  ]

  return (
    <div className="flex flex-col flex-1 px-2 pb-1 border border-gray-400 rounded">
      <div className="flex justify-between items-center w-full">
        <h2 className="m-0">Rewards</h2>
        <EditButton
          active={rewardState.editing}
          onClick={() => updateRewards({ type: 'TOGGLE_EDITING' })}
          disabled={
            fetcher?.state === 'loading' || fetcher?.state === 'submitting'
          }
        />
      </div>
      {rewardState.editing ? (
        <ValidatedForm
          validator={rewardValidator}
          method="POST"
          className="flex flex-1 flex-col gap-2"
          fetcher={fetcher}
          action={formAction}
        >
          <div className="flex flex-col items-start w-fit py-2">
            {rewardsToShow.length === 0 ? (
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
          <div className="flex justify-between items-center flex-1">
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
            <SubmitButton
              className="btn btn-primary btn-outline"
              fetcher={fetcher}
            >
              Save
            </SubmitButton>
            {rewardState.rewardsToAdd.map((id, i) => (
              <input
                key={`rewardsToAdd-${id}`}
                type="hidden"
                name={`rewardsToAdd[${i}]`}
                value={id}
              />
            ))}
            {rewardState.rewardsToRemove.map((id, i) => (
              <input
                key={`rewardsToRemove-${id}`}
                type="hidden"
                name={`rewardsToRemove[${i}]`}
                value={id}
              />
            ))}
          </div>
        </ValidatedForm>
      ) : !imperialPlayer.rewards.length ? (
        <p className="m-0 py-2">No Rewards</p>
      ) : (
        <div className="flex flex-col items-start w-fit py-2">
          {imperialPlayer.rewards.map((reward) => (
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
