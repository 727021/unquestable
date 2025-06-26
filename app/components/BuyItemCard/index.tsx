import type { Item } from '@prisma/client'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { TrashIcon } from '@heroicons/react/24/outline'
import { getSellPrice } from '~/utils/sellPrice'
import { sortItems } from '~/utils/sortItems'
import type { FieldApi, FormApi } from '@rvf/react-router'

type Props = {
  cards: Item[]
  owned: Item[]
  credits: number
  nameBought: string
  nameSold: string
  label: ReactNode
  formApi: FormApi<any>
}

const BuyItemCard = ({
  credits,
  nameBought,
  nameSold,
  cards,
  owned,
  label,
  formApi
}: Props) => {
  const bought: FieldApi<number[]> = formApi.field(nameBought)
  const sold: FieldApi<number[]> = formApi.field(nameSold)

  const boughtItems = sortItems(
    cards.filter((c) => bought.value().includes(c.id))
  )
  const soldItems = sortItems(owned.filter((o) => sold.value().includes(o.id)))

  const canBuy = sortItems(cards.filter((c) => !bought.value().includes(c.id)))
  const canSell = sortItems(owned.filter((o) => !sold.value().includes(o.id)))

  const [buying, setBuying] = useState(-1)
  const [selling, setSelling] = useState(-1)

  const buyingItem = cards.find(({ id }) => id === buying)
  const sellingItem = owned.find(({ id }) => id === selling)

  const handleBuy = () => {
    if (!buyingItem || bought.value().includes(buying)) {
      return
    }

    bought.setValue([...bought.value(), buying])
    setBuying(-1)
  }
  const handleBuyRemove = (id: Item['id']) => {
    bought.setValue(bought.value().filter((b) => b !== id))
    setBuying(id)
  }
  const handleSell = () => {
    if (!sellingItem || sold.value().includes(selling)) {
      return
    }

    sold.setValue([...sold.value(), selling])
    setSelling(-1)
  }
  const handleSellRemove = (id: Item['id']) => {
    sold.setValue(sold.value().filter((s) => s !== id))
    setSelling(id)
  }

  const balance =
    credits -
    boughtItems.reduce((acc, cur) => acc + cur.cost, 0) +
    soldItems.reduce((acc, cur) => acc + (cur.cost ? getSellPrice(cur.cost) : 50), 0)

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
            {boughtItems.map((b) => (
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
              </div>
            ))}
            {bought.value().map((_, i) => (
              <input {...formApi.getHiddenInputProps(`${nameBought}[${i}]`)} />
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
            {soldItems.map((s) => (
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
              </div>
            ))}
            {sold.value().map((_, i) => (
              <input {...formApi.getHiddenInputProps(`${nameSold}[${i}]`)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuyItemCard
