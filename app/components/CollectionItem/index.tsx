import type { Expansion } from '@prisma/client'
import { useFetcher } from '@remix-run/react'

type Props = {
  expansion: Expansion,
  owned?: boolean
}

const CollectionItem = ({ expansion, owned }: Props) => {
  const fetcher = useFetcher<{ owned: boolean }>()

  const isOwned = fetcher.state !== 'idle'
    ? fetcher.formData?.get('action') === 'add'
    : owned

  return (
    <li>
      {(expansion.defaultOwned || isOwned) ? '🟩' : '🟥'}
      {expansion.name}
      {!expansion.defaultOwned && (
        <fetcher.Form method="POST">
          <input type="hidden" name="expansionId" value={expansion.id} />
          <button type="submit" disabled={fetcher.state !== 'idle'} name="action" value={isOwned ? 'remove' : 'add'}>{isOwned ? 'Remove' : 'Add'}</button>
        </fetcher.Form>
      )}
    </li>
  )
}

export default CollectionItem