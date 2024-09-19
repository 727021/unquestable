import type { LoaderFunction } from '@vercel/remix'
import { authenticator } from '~/services/auth.server'

export const loader: LoaderFunction = async ({ request }) => {
  return authenticator.authenticate('discord', request, {
    successRedirect: '/home',
    failureRedirect: '/login'
  })
}
