import { redirect } from '@vercel/remix'
import type { ActionFunction, LoaderFunction } from '@vercel/remix'
import { authenticator } from '~/services/auth.server'

export const loader: LoaderFunction = async () => redirect('/login')

export const action: ActionFunction = async ({ request }) => {
  return authenticator.authenticate('discord', request)
}
