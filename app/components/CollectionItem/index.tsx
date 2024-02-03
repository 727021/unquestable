import type { BoxArt, Expansion } from '@prisma/client'
import { useFetcher } from '@remix-run/react'
import clsx from 'clsx'

import coreWebp from '../../../public/img/expansion/core.webp'
import corePng from '../../../public/img/expansion/core.png'

type Props = {
  expansion: Expansion & { boxArt: BoxArt[] },
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

  return expansion.defaultOwned ? (
    <div className="w-96 max-w-full card card-compact card-bordered">
      <figure>
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
      </figure>
      <div className="card-body w-full">
        <h2 className="card-title">
          {expansion.name}
        </h2>
      </div>
    </div>
  ) : (
    <fetcher.Form method="POST" className="w-96 max-w-full">
      <input type="hidden" name="expansionId" value={expansion.id} />
      <button className="card card-compact card-bordered w-full" type="submit" name="action" value={isOwned ? 'remove' : 'add'}>
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
          </h2>
        </div>
      </button>
    </fetcher.Form>
  )
}

export default CollectionItem