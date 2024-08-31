import type { FetcherWithComponents } from '@remix-run/react'
import type { Reducer } from 'react'
import { useCallback, useEffect, useReducer } from 'react'
import type { LoaderData as GameLoaderData } from '~/routes/_app.games.$game'
import type { LoaderData } from '~/routes/_app.games.$game.empire'
import EditButton from '../EditButton'
import { ValidatedForm } from 'remix-validated-form'
import { rewardValidator } from '~/routes/_app.games.$game.empire.rewards'
import SubmitButton from '../SubmitButton'

type RewardId = LoaderData['rewards'][0]['id']

type State = {
  editing: boolean
  rewardsToAdd: RewardId[]
  rewardsToRemove: RewardId[]
}

type Action =
  | { type: 'TOGGLE_EDITING' | 'STOP_EDITING' }
  | { type: 'ADD_REWARD' | 'REMOVE_REWARD'; rewardId: RewardId }

const initialState: State = {
  editing: false,
  rewardsToAdd: [],
  rewardsToRemove: []
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
              )
            }
          }
          return {
            ...state,
            rewardsToAdd: [...state.rewardsToAdd, action.rewardId],
            rewardsToRemove: state.rewardsToRemove.filter(
              (id) => id !== action.rewardId
            )
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
              )
            }
          }
          return {
            ...state,
            rewardsToAdd: state.rewardsToAdd.filter(
              (id) => id !== action.rewardId
            ),
            rewardsToRemove: [...state.rewardsToRemove, action.rewardId]
          }
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
          {rewardsToShow.length === 0 ? (
            <div className="flex-1">
              <p className="m-0">No Rewards</p>
            </div>
          ) : (
            <div className="flex flex-col items-start w-fit py-2">
              {rewardsToShow.map((reward) => (
                <p className="m-0" key={reward.id}>
                  {reward.name}
                </p>
              ))}
            </div>
          )}
          <div className="flex justify-between items-center flex-1">
            {/* TODO: selct input */}
            <span>Select</span>
            <SubmitButton
              className="btn btn-primary btn-outline"
              fetcher={fetcher}
            >
              Save
            </SubmitButton>
            {/* TODO: hidden inputs for add/remove */}
          </div>
        </ValidatedForm>
      ) : !imperialPlayer.rewards.length ? (
        <p className="m-0">No Rewards</p>
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
