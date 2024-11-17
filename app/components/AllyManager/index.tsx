import type { LoaderData as GameLoaderData } from '~/routes/_app.games.$game'
import type { LoaderData } from '~/routes/_app.games.$game.rebels'
import EditButton from '../EditButton'
import clsx from 'clsx'

type Props = {
  allies: GameLoaderData['game']['allies']
  allAllies: LoaderData['troops']
}

const AllyManager = ({ allies, allAllies }: Props) => {
  return (
    <div className="flex flex-col flex-1 px-2 py-1 gap-2 border border-gray-400 rounded">
      <div className="flex justify-between items-center w-full">
        <h3 className="m-0">Allies</h3>
        <EditButton active={false} onClick={() => {}} hideLabel />
      </div>
      {!allies.length ? (
        <p className="m-0">No Allies</p>
      ) : (
        <div className="flex flex-col items-start w-fit py-2">
          {allies.map((ally) => (
            <p
              key={ally.id}
              className={clsx('m-0', ally.elite && 'text-red-600')}
            >
              {ally.name}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

export default AllyManager
