import type { LoaderFunctionArgs} from '@remix-run/node';
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { getUser } from '~/services/auth.server'
import { getAvatarUrls } from '~/utils/avatar'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request)
  return json({ user })
}

const Profile = () => {
  const data = useLoaderData<typeof loader>()

  const avatarUrls = getAvatarUrls(data.user, 128)

  return (
    <div>
      <h1>Profile</h1>
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

export default Profile
