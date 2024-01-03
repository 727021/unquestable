import { redirect} from '@remix-run/node';
import type { ActionFunction , LoaderFunction } from '@remix-run/node';
import { authenticator } from '~/services/auth.server'

export const loader: LoaderFunction = async () => redirect('/login')

export const action: ActionFunction = async ({ request }) => {
  return authenticator.authenticate('google', request)
}
