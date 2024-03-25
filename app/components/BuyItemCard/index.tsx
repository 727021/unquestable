import type { Item } from '@prisma/client'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { useFieldArray } from 'remix-validated-form'

type Props = {
  cards: Item[]
  owned: Item[]
  credits: number
  name: string
  label: ReactNode
}

const BuyItemCard = ({ credits, name }: Props) => {
  const [bought, { push: bPush, remove: bRemove }, bError] = useFieldArray(
    `${name}.bought`
  )
  const [sold, { push: sPush, remove: sRemove }, sError] = useFieldArray(
    `${name}.sold`
  )

  const [buying, setBuying] = useState(-1)
  const [selling, setSelling] = useState(-1)

  return <div></div>
}

export default BuyItemCard
