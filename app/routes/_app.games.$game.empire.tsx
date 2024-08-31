import clsx from 'clsx'
import { useFetcher, useFormAction, useOutletContext } from '@remix-run/react'
import type { LoaderData } from './_app.games.$game'
import type { ActionData } from './_app.games.$game.empire.agendas'
import AgendaManager from '~/components/AgendaManager'

const Empire = () => {
  const data = useOutletContext<LoaderData>()
  const imperialPlayer = data.game.imperialPlayer!

  const agendaFetcher = useFetcher<ActionData>()
  const agendasFormAction = useFormAction('agendas')

  return (
    <>
      <div className="flex flex-col flex-1 gap-2">
        <div className="flex gap-3 items-baseline">
          <h2 className="m-0">Empire</h2>
        </div>
        <div className="flex flex-1 px-2 pb-1 gap-2 border border-gray-400 rounded justify-between">
          <div>
            <span className="font-bold">Name:</span> {imperialPlayer.name}
          </div>
          <div>
            <span className="font-bold">XP:</span> {imperialPlayer.xp}
          </div>
          <div>
            <span className="font-bold">Influence:</span>{' '}
            {imperialPlayer.influence}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-col flex-1 px-2 pb-1 border border-gray-400 rounded">
            <h2 className="m-0">{imperialPlayer.class.name}</h2>
            <div className="form-control items-start w-fit py-2">
              {imperialPlayer.class.cards.map((card) => (
                <label
                  key={card.id}
                  className="label cursor-default gap-2 flex py-1"
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm cursor-default"
                    checked={imperialPlayer.classCards.some(
                      (c) => c.id === card.id
                    )}
                    readOnly
                  />
                  <span className="label-text">
                    {card.cost} XP - {card.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <AgendaManager
            imperialPlayer={imperialPlayer}
            fetcher={agendaFetcher}
            formAction={agendasFormAction}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-col flex-1 px-2 pb-1 border border-gray-400 rounded">
            <h2 className="m-0">Rewards</h2>
            {!imperialPlayer.rewards.length ? (
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
          <div className="flex flex-col flex-1 px-2 pb-1 border border-gray-400 rounded">
            <h2 className="m-0">Villains</h2>
            {!imperialPlayer.villains.length ? (
              <p className="m-0">No Villains</p>
            ) : (
              <div className="flex flex-col items-start w-fit-py-2">
                {imperialPlayer.villains.map((villain) => (
                  <p
                    className={clsx('m-0', villain.elite && 'text-red-600')}
                    key={villain.id}
                  >
                    {villain.name}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Empire
