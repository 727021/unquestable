import EditButton from '~/components/EditButton'
import type { LoaderData as GameLoaderData } from '~/routes/_app.games.$game'

type Props = {
  rebel: GameLoaderData['game']['rebelPlayers'][0]
}

const RebelSummaryManager = ({ rebel }: Props) => {
  return (
    <div className="flex flex-col flex-1">
      <div className="flex gap-2 justify-between items-center">
        <h2 className="m-0">{rebel.hero.name}</h2>
        <EditButton active={false} onClick={() => {}} hideLabel />
      </div>
      <div className="flex flex-1 gap-2 justify-between items-baseline">
        <div>
          <span className="font-bold">Name:</span> {rebel.name}
        </div>
        <div>
          <span className="font-bold">XP:</span> {rebel.xp}
        </div>
      </div>
    </div>    
  )
}

export default RebelSummaryManager
