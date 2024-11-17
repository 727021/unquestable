import type { LoaderData as GameLoaderData } from '~/routes/_app.games.$game'
import EditButton from '../EditButton'

type Props = {
  rebel: GameLoaderData['game']['rebelPlayers'][0]
}

const RebelRewardManager = ({ rebel }: Props) => {
  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center w-full">
        <h3 className="m-0">Rewards</h3>
        <EditButton active={false} onClick={() => {}} hideLabel />
      </div>
      {!rebel.rewards.length ? (
        <p className="m-0 py-2">No Rewards</p>
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
