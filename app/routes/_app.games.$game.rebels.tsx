import { useOutletContext } from '@remix-run/react'
import type { LoaderData as GameLoaderData } from './_app.games.$game'
import RebelSummaryManager from '~/components/RebelSummaryManager'
import RebelClassManager from '~/components/RebelClassManager'
import RebelRewardManager from '~/components/RebelRewardManager'

const Rebels = () => {
  const data = useOutletContext<GameLoaderData>()

  return (
    <>
      <div className="flex flex-col flex-1 gap-2">
        <div className="flex gap-3 items-baseline">
          <h2 className="m-0">Rebels</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 flex-1">
          {data.game.rebelPlayers.map((rebel) => (
            <div
              key={rebel.id}
              className="flex flex-col flex-1 px-2 py-1 gap-2 border border-gray-400 rounded"
            >
              <RebelSummaryManager rebel={rebel} />
              <hr className="border-gray-400 my-0" />
              <RebelClassManager rebel={rebel} />
              {rebel.rewards.length > 0 && (
                <>
                  <hr className="border-gray-400 my-0" />
                  <RebelRewardManager rebel={rebel} />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Rebels
