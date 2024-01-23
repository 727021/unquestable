import { useFetcher } from '@remix-run/react'
import { clsx } from 'clsx'

import coreWebp from '../../../public/img/expansion/core.webp'
import corePng from '../../../public/img/expansion/core.png'

type Props = {
  expansion: any, // Expansion & { boxArt: BoxArt[] },
  owned?: boolean
}

const CollectionItem = ({ expansion, owned }: Props) => {
  const fetcher = useFetcher<{ owned: boolean }>()

  const loading = fetcher.state !== 'idle'
  const isOwned = loading
    ? fetcher.formData?.get('action') === 'add'
    : owned

  const png = expansion.boxArt.find(art => art.mime === 'image/png')
  const others = expansion.boxArt.filter(art => art.mime !== 'image/png')
  const alt = expansion.boxArt.find(art => art.alt)?.alt ?? ''

  return (
    <fetcher.Form method="POST" className="w-96 max-w-full">
      <input type="hidden" name="expansionId" value={expansion.id} />
      <button className="card card-compact card-bordered w-full" type="submit" disabled={loading} name="action" value={isOwned ? 'remove' : 'add'}>
        <figure>
          <picture className={clsx(!isOwned && 'grayscale')}>
            {png ? (
              <>
                {others.map(art => <source key={art.id} src={art.url} type={art.mime} />)}
                <img src={png?.url} alt={alt} />
              </>
            ) : (
              <>
                <source src={coreWebp} type="image/webp" />
                <img src={corePng} alt="" />
              </>
            )}
          </picture>
        </figure>
        <div className="card-body w-full">
          <h2 className="card-title justify-between align-center">
            {expansion.name}
            {loading && <span className="loading loading-spinner loading-md"></span>}
          </h2>
        </div>
      </button>
    </fetcher.Form>
  )
}

export default CollectionItem