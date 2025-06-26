import type { ClassCard } from '@prisma/client'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import type { FormApi } from '@rvf/react-router'

type Props = {
  cards: ClassCard[]
  xp: number
  name: string
  label: ReactNode
  owned: ClassCard[]
  formApi: FormApi<any>
}

const BuyClassCard = ({ cards, xp, name, label, owned, formApi }: Props) => {
  const field = formApi.field(name)
  const error = field.error()

  const buyable = cards.filter((c) => !owned.some((o) => o.id === c.id))

  const balance = cards
    .filter((c) => field.value().some((v: string) => +v === c.id))
    .map((c) => c.cost)
    .reduce((acc, cur) => acc - cur, xp)

  return (
    <div className="form-control items-start w-fit border px-2 py-0 rounded">
      <div className="label w-full gap-1">
        <span className="label-text">{label}</span>
        <span className="label-text-alt">Available XP: {balance}</span>
      </div>
      {owned.map((card) => (
        <label
          className={clsx(
            // card.tagline && 'tooltip before:whitespace-break-spaces',
            'label cursor-pointer gap-1 flex py-1'
          )}
          key={card.id}
          data-tip={card.tagline}
        >
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={true}
            onChange={(e) => e.preventDefault()}
          />
          <span className="label-text">
            {card.cost} XP - {card.name}
          </span>
        </label>
      ))}
      <div className="divider m-0"></div>
      {buyable.map((card) => (
        <label
          className={clsx(
            // card.tagline && 'tooltip before:whitespace-break-spaces',
            'label cursor-pointer gap-1 flex py-1'
          )}
          key={card.id}
          data-tip={card.tagline}
        >
          <input
            {...field.getInputProps({
              type: 'checkbox',
              className:
                'checkbox checkbox-sm checkbox-primary border-neutral hover:border-neutral',
              value: card.id,
              disabled:
                !field.value().some((c: string) => +c === card.id) &&
                card.cost > balance
            })}
            data-cost={card.cost}
          />
          <span className="label-text">
            {card.cost} XP - {card.name}
          </span>
        </label>
      ))}
      <div className="label">
        {error && <span className="label-text-alt text-error">{error}</span>}
      </div>
    </div>
  )
}

export default BuyClassCard
