import {
  Link,
  useOutletContext,
  useParams
} from '@remix-run/react'
import clsx from 'clsx'
import type { LoaderData } from './_app.games.$game'

const Game = () => {
  const params = useParams()
  const data = useOutletContext<LoaderData>()

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        <div className="flex flex-col flex-1">
          <h2 className="m-0">Campaign Log</h2>
          <table className="table m-0">
            <thead>
              <tr>
                <td></td>
                <td>Mission</td>
                <td>Threat Level</td>
                <td>Result</td>
              </tr>
            </thead>
            <tbody>
              {data.game.campaign.missionSlots.map((slot, i, arr) => (
                <tr
                  key={slot.index}
                  className={clsx(
                    !slot.gameMissions?.[0] &&
                      !arr[i - 1]?.gameMissions?.[0]?.resolved
                      ? 'bg-base-300'
                      : 'hover'
                  )}
                >
                  <td>
                    {i === 0
                      ? 'Introduction'
                      : i === arr.length - 1
                        ? 'Finale'
                        : slot.type === 'SIDE'
                          ? 'Side Mission'
                          : 'Story Mission'}
                  </td>
                  {slot.gameMissions[0] ? (
                    <td>{slot.gameMissions[0].mission.name}</td>
                  ) : (
                    <td>
                      {/*
                        TODO: choose side mission
                        maybe do this in a modal? probably don't need an entire page
                        IF:
                          This slot is for a side mission
                          The previous mission is resolved
                          There are no active forced missions
                      */}
                    </td>
                  )}
                  <td className="text-center">{slot.threat}</td>
                  {slot.gameMissions[0] ? (
                    slot.gameMissions[0].resolved ? (
                      <td>
                        {slot.gameMissions[0].winner === 'IMPERIAL'
                          ? 'Empire'
                          : 'Rebels'}
                      </td>
                    ) : (
                      <td>
                        <Link
                          to={`/games/${params.game}/resolve/${slot.gameMissions[0].id}`}
                          className="btn btn-sm btn-primary"
                        >
                          Resolve
                        </Link>
                      </td>
                    )
                  ) : (
                    <td></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {/* TODO: Display forced missions */}
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <Link
            to={`/games/${params.game}/empire`}
            className="w-full no-underline"
          >
            <div className="flex gap-5 items-baseline">
              <h2 className="m-0">Empire</h2>
              {data.game.imperialPlayer?.name && (
                <span>({data.game.imperialPlayer.name})</span>
              )}
            </div>
            <p className="m-0">Class: {data.game.imperialPlayer?.class.name}</p>
            <p className="m-0">XP: {data.game.imperialPlayer?.xp}</p>
            <p className="m-0">
              Influence: {data.game.imperialPlayer?.influence}
            </p>
          </Link>
          <Link
            to={`/games/${params.game}/rebels`}
            className="w-full no-underline"
          >
            <h2 className="m-0">Rebels</h2>
            <p className="m-0">Credits: {data.game.credits}</p>
            <table className="table table-sm m-0">
              <thead>
                <tr>
                  <th>Hero</th>
                  <th>XP</th>
                </tr>
              </thead>
              <tbody>
                {data.game.rebelPlayers.map((rebel) => (
                  <tr key={rebel.id}>
                    <td className="flex gap-5 items-baseline">
                      <p className="m-0">{rebel.hero.name}</p>
                      {rebel.name && <span>({rebel.name})</span>}
                    </td>
                    <td>{rebel.xp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Link>
        </div>
      </div>
    </>
  )
}

export default Game
