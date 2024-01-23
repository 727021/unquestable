import type { LoaderFunctionArgs} from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { getUser } from '~/services/auth.server'
import { getAvatarUrls } from '~/utils/avatar'

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const user = await getUser(request, context)
  return json({ user })
}

const Index = () => {
  const data = useLoaderData<typeof loader>()

  const avatarUrls = getAvatarUrls(data.user, 128)

  return (
    <div>
      <h1>Dashboard</h1>
      <pre>
        {JSON.stringify(data, null, 2)}
      </pre>
      <picture>
        {avatarUrls.webp && <source src={avatarUrls.webp} />}
        <img src={avatarUrls.gif ?? avatarUrls.png} alt="" />
      </picture>
    </div>
  )
}

export default Index
