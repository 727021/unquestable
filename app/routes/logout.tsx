import type { LoaderFunction } from '@remix-run/cloudflare'
import { getAuthenticator } from '~/services/auth.server'

export const loader: LoaderFunction = async ({ request, context }) => {
  await getAuthenticator(context).logout(request, {
    redirectTo: '/'
  })
}
