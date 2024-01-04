import { useOutletContext } from '@remix-run/react'
import type { LoaderData as AppLoaderData } from './app'
import { getAvatarUrls } from '~/utils/avatar'

const Index = () => {
  const outletData = useOutletContext<AppLoaderData>()

  const avatarUrls = getAvatarUrls(outletData.user, 128)

  return (
    <div>
      <h1>Dashboard</h1>
      <pre>
        {JSON.stringify(outletData, null, 2)}
      </pre>
      <picture>
        {avatarUrls.webp && <source src={avatarUrls.webp} />}
        <img src={avatarUrls.gif ?? avatarUrls.png} alt="" />
      </picture>
    </div>
  )
}

export default Index
