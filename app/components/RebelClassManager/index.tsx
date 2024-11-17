import type { LoaderData as GameLoaderData } from '~/routes/_app.games.$game'
import EditButton from '../EditButton'

type Props = {
  rebel: GameLoaderData['game']['rebelPlayers'][0]
}

const RebelClassManager = ({ rebel }: Props) => {
  return (
    <div className="flex flex-col flex-1">
      <div className="flex justify-between items-center w-full">
        <h3 className="m-0">Class</h3>
        <EditButton active={false} onClick={() => {}} hideLabel />
      </div>
      <div className="form-control items-start w-fit py-2">
        {rebel.hero.class?.cards.map((card) => (
          <label
            key={card.id}
            className="label cursor-default gap-2 flex py-1"
          >
            <input
              type="checkbox"
              className="checkbox checkbox-sm cursor-default"
              checked={rebel.classCards.some((c) => c.id === card.id)}
              readOnly
            />
            <span className="label-text">
              {card.cost} XP - {card.name}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

export default RebelClassManager
