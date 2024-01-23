import type { LoaderFunction } from '@remix-run/cloudflare'
import { getAuthenticator } from '~/services/auth.server'

export const loader: LoaderFunction = async ({ request, context }) => {
  return getAuthenticator(context).authenticate('discord', request, {
    successRedirect: '/home',
    failureRedirect: '/login'
  })
}
