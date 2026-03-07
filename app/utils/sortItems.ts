import type { Item } from '@prisma/client'

export const sortItems = (items: Item[]) =>
  items.toSorted((a, b) => a.tier - b.tier || a.cost - b.cost)
