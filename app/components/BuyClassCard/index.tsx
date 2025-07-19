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
    <fieldset className="fieldset items-start w-fit border px-2 py-0 rounded-xs gap-0">
      <label className="label w-full gap-4 flex justify-between text-base-content">
        <span>{label}</span>
        <span>Available XP: {balance}</span>
      </label>
      {owned.map((card) => (
        <label
          className={clsx(
            // card.tagline && 'tooltip before:whitespace-break-spaces',
            'label cursor-default! gap-1 flex py-1'
          )}
          key={card.id}
          data-tip={card.tagline}
        >
          <input
            type="checkbox"
            className="checkbox checkbox-neutral checkbox-sm cursor-default!"
            checked={true}
            onChange={(e) => e.preventDefault()}
          />
          <span className="text-base-content">
            {card.cost} XP - {card.name}
          </span>
        </label>
      ))}
      <div className="divider m-0"></div>
      {buyable.map((card) => {
        const disabled = !field.value().some((v: string) => +v === card.id) && card.cost > balance
        return (
        <label
          className={clsx(
            // card.tagline && 'tooltip before:whitespace-break-spaces',
            'label gap-1 flex py-1',
            disabled ? 'cursor-not-allowed!' : 'cursor-pointer'
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
              disabled
            })}
            data-cost={card.cost}
          />
          <span className={clsx(!disabled && 'text-base-content')}>
            {card.cost} XP - {card.name}
          </span>
        </label>
      )})}
      <div className="label">
        {error && <span className="text-error">{error}</span>}
      </div>
    </fieldset>
  )
}

export default BuyClassCard
