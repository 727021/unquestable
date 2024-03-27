import type { Item } from '@prisma/client'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { TrashIcon } from '@heroicons/react/24/outline'
import { getSellPrice } from '~/utils/sellPrice'

type Props = {
  cards: Item[]
  owned: Item[]
  credits: number
  nameBought: string
  nameSold: string
  label: ReactNode
}

const BuyItemCard = ({
  credits,
  nameBought,
  nameSold,
  cards,
  owned,
  label
}: Props) => {
  const [bought, setBought] = useState<Item[]>([])
  const [sold, setSold] = useState<Item[]>([])

  const canBuy = cards.filter((c) => !bought.some((b) => b.id === c.id))
  const canSell = owned.filter((o) => !sold.some((s) => s.id === o.id))

  const [buying, setBuying] = useState(-1)
  const [selling, setSelling] = useState(-1)

  const buyingItem = cards.find(({ id }) => id === buying)
  const sellingItem = owned.find(({ id }) => id === selling)

  const handleBuy = () => {
    if (!buyingItem || bought.some((b) => b.id === buying)) {
      return
    }

    setBought((prev) => [...prev, buyingItem])
    setBuying(-1)
  }
  const handleBuyRemove = (id: Item['id']) => {
    setBought((prev) => prev.filter((b) => b.id !== id))
    setBuying(id)
  }
  const handleSell = () => {
    if (!sellingItem || sold.some((s) => s.id === selling)) {
      return
    }

    setSold((prev) => [...prev, sellingItem])
    setSelling(-1)
  }
  const handleSellRemove = (id: Item['id']) => {
    setSold((prev) => prev.filter((s) => s.id !== id))
    setSelling(id)
  }

  const balance =
    credits -
    bought.reduce((acc, cur) => acc + cur.cost, 0) +
    sold.reduce((acc, cur) => acc + (cur.cost ? getSellPrice(cur.cost) : 50), 0)

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center">
        <h3 className="m-0 inline">{label}</h3>
        <span>Available Credits: {balance}</span>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <div className="form-control w-full">
            <div className="join">
              <select
                className="select select-bordered join-item w-full"
                value={buying}
                onChange={(e) => setBuying(parseInt(e.target.value, 10))}
              >
                <option value={-1} disabled>
                  Choose an Item
                </option>
                {canBuy.map(
                  (c) =>
                    c.cost <= balance && (
                      <option key={c.id} value={c.id}>
                        {c.cost} CR - {c.name} ({'I'.repeat(c.tier)})
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
                <i>{buyingItem?.tagline}&nbsp;</i>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {bought.map((b) => (
              <div className="inline-flex gap-1 items-center" key={b.id}>
                <button
                  type="button"
                  className="btn btn-xs btn-outline btn-error px-1"
                  onClick={() => handleBuyRemove(b.id)}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
                <span>
                  {b.cost} CR - {b.name} ({'I'.repeat(b.tier)})
                </span>
                <input type="hidden" name={nameBought} value={b.id} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <div className="form-control w-full">
            <div className="join">
              <select
                className="select select-bordered join-item w-full"
                value={selling}
                onChange={(e) => setSelling(parseInt(e.target.value, 10))}
              >
                <option value={-1} disabled>
                  Choose an Item
                </option>
                {canSell.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.cost} ({getSellPrice(c.cost)}) CR - {c.name} (
                    {'I'.repeat(c.tier)})
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-outline join-item"
                onClick={handleSell}
              >
                Sell
              </button>
            </div>
            <div className="label">
              <div className="label-text-alt whitespace-break-spaces">
                <i>{sellingItem?.tagline}&nbsp;</i>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {sold.map((s) => (
              <div className="inline-flex gap-1 items-center" key={s.id}>
                <button
                  type="button"
                  className="btn btn-xs btn-outline btn-error px-1"
                  onClick={() => handleSellRemove(s.id)}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
                <span>
                  {s.cost} ({getSellPrice(s.cost)}) CR - {s.name} (
                  {'I'.repeat(s.tier)})
                </span>
                <input type="hidden" name={nameSold} value={s.id} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuyItemCard
