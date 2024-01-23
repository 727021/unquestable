import { redirect } from '@remix-run/cloudflare'
import type { ActionFunction , LoaderFunction } from '@remix-run/cloudflare'
import { getAuthenticator } from '~/services/auth.server'

export const loader: LoaderFunction = async () => redirect('/login')

export const action: ActionFunction = async ({ request, context }) => {
  try {
    return getAuthenticator(context).authenticate('discord', request)
  } catch (error) {
    console.error(error)
    return redirect('/')
  }
}
