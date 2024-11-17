import type { LoaderData as GameLoaderData } from '~/routes/_app.games.$game'
import type { LoaderData } from '~/routes/_app.games.$game.rebels'
import EditButton from '../EditButton'
import { sortItems } from '~/utils/sortItems'

type Props = {
  items: GameLoaderData['game']['items']
  allItems: LoaderData['items']
  credits: GameLoaderData['game']['credits']
}

const ItemManager = ({ items, allItems, credits }: Props) => {
  return (
    <div className="flex flex-col flex-1 px-2 py-1 gap-2 border border-gray-400 rounded">
      <div className="flex flex-col">
        <div className="flex justify-between items-center w-full">
          <h3 className="m-0">Items</h3>
          <EditButton active={false} onClick={() => {}} hideLabel />
        </div>
        <div>
          <span className="font-bold">Credits:</span> {credits}
        </div>
      </div>
      <hr className="border-gray-400 my-0" />
      <div className="flex flex-col">
        {sortItems(items).map((item) => (
          <p key={item.id} className="m-0">
            {item.cost} CR - {item.name} ({'I'.repeat(item.tier)})
          </p>
        ))}
      </div>
    </div>
  )
}

export default ItemManager
