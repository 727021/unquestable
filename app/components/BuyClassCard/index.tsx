import type { ClassCard } from '@prisma/client'
import clsx from 'clsx'
import type { ChangeEvent, ElementRef, ReactNode } from 'react'
import { useState } from 'react'
import { useField } from 'remix-validated-form'

type Props = {
  cards: ClassCard[]
  xp: number
  name: string
  label: ReactNode
}

const BuyClassCard = ({ cards, xp, name, label }: Props) => {
  const [checked, setChecked] = useState<number[]>([])
  const { getInputProps, error } = useField(name)

  const handleCheck = (e: ChangeEvent<ElementRef<'input'>>) => {
    const value = parseInt(e.target.value, 10)
    if (e.target.checked) {
      setChecked((prev) => [...prev, value])
    } else {
      setChecked((prev) => prev.filter((v) => v !== value))
    }
  }

  const balance = cards
    .filter((c) => checked.includes(c.id))
    .map((c) => c.cost)
    .reduce((acc, cur) => acc - cur, xp)

  return (
    <div className="form-control items-start w-fit border px-2 py-0 rounded">
      <div className="label w-full gap-1">
        <span className="label-text">{label}</span>
        <span className="label-text-alt">Available XP: {balance}</span>
      </div>
      {cards.map((card) => (
        <label
          className={clsx(
            // card.tagline && 'tooltip before:whitespace-break-spaces',
            'label cursor-pointer gap-1 flex py-1'
          )}
          key={card.id}
          data-tip={card.tagline}
        >
          <input
            {...getInputProps({
              type: 'checkbox',
              className: 'checkbox checkbox-sm',
              value: card.id,
              checked: checked.includes(card.id),
              onChange: handleCheck,
              disabled: !checked.includes(card.id) && card.cost > balance
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
