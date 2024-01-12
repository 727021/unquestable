import type { Expansion } from '@prisma/client'
import { useFetcher } from '@remix-run/react'
import classNames from 'classnames'

type Props = {
  expansion: Expansion,
  owned?: boolean
}

const CollectionItem = ({ expansion, owned }: Props) => {
  const fetcher = useFetcher<{ owned: boolean }>()

  const loading = fetcher.state !== 'idle'
  const isOwned = loading
    ? fetcher.formData?.get('action') === 'add'
    : owned

  return (
    <div className="card bg-base-100 image-full max-w-96 lg:max-w-none">
      <figure><img src={`https://placehold.co/600x400/green/white?text=${expansion.name}`} alt="" className={classNames({ grayscale: !isOwned })} /></figure>
      <div className="card-body">
        <h2 className="card-title flex-grow flex items-start">{expansion.name}</h2>
        {!expansion.defaultOwned && (
          <fetcher.Form method="POST" className="card-actions justify-center">
            <input type="hidden" name="expansionId" value={expansion.id} />
            <button className={classNames('btn', 'sm:btn-wide', { 'btn-neutral': !isOwned, 'btn-ghost': isOwned })} type="submit" disabled={loading} name="action" value={isOwned ? 'remove' : 'add'}>
              {loading ? (<span className="loading loading-spinner loading-md"></span>) : isOwned ? 'Remove' : 'Add'}
            </button>
          </fetcher.Form>
        )}
      </div>
    </div>
  )
}

export default CollectionItem