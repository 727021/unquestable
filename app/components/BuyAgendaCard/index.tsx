import { TrashIcon } from '@heroicons/react/24/outline'
import type { Agenda } from '@prisma/client'
import { FieldApi, FormApi } from '@rvf/react-router'
import { useState, type ReactNode } from 'react'

type Props = {
  cards: Agenda[]
  influence: number
  name: string
  label: ReactNode
  formApi: FormApi<any>
}

const BuyAgendaCard = ({ cards, influence, label, name, formApi }: Props) => {
  const bought: FieldApi<number[]> = formApi.field(name)

  const boughtCards = cards.filter((c) => bought.value().includes(c.id))

  const canBuy = cards
    .filter((c) => !bought.value().includes(c.id))
    .toSorted((a, b) => a.cost - b.cost)

  const [buying, setBuying] = useState(-1)

  const buyingCard = cards.find(({ id }) => id === buying)

  const handleBuy = () => {
    if (!buyingCard || bought.value().includes(buying)) {
      return
    }

    bought.setValue([...bought.value(), buying])
    setBuying(-1)
  }
  const handleRemove = (id: Agenda['id']) => {
    bought.setValue(bought.value().filter((b) => b !== id))
    setBuying(id)
  }

  const balance =
    influence - boughtCards.reduce((acc, cur) => acc + cur.cost, 0)

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center">
        <h3 className="m-0 inline">{label}</h3>
        <span>Influence: {balance}</span>
      </div>
      <div className="flex-1">
        <div className="form-control w-full">
          <div className="join">
            <select
              className="select select-bordered join-item w-full"
              value={buying}
              onChange={(e) => setBuying(parseInt(e.target.value, 10))}
            >
              <option value={-1} disabled>
                Choose an Agenda
              </option>
              {canBuy.map(
                (c) =>
                  c.cost <= balance && (
                    <option key={c.id} value={c.id}>
                      {c.cost} - {c.name}
                    </option>
                  )
              )}
            </select>
            <button
              type="button"
              className="btn btn-outline join-item"
              onClick={handleBuy}
            >
              Buy
            </button>
          </div>
          <div className="label">
            <div className="label-text-alt whitespace-break-spaces">
              <i>{buyingCard?.tagline}&nbsp;</i>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {boughtCards
            .toSorted((a, b) => a.cost - b.cost)
            .map((b) => (
              <div className="inline-flex gap-1 items-center" key={b.id}>
                <button
                  type="button"
                  className="btn btn-xs btn-outline btn-error px-1"
                  onClick={() => handleRemove(b.id)}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
                <span>
                  {b.cost} - {b.name}
                </span>
              </div>
            ))}
          {bought.value().map((_, i) => (
            <input {...formApi.getHiddenInputProps(`${name}[${i}]`)} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default BuyAgendaCard
