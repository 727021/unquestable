import { getAuth } from '@clerk/react-router/ssr.server'
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router'
import { redirect } from 'react-router'

export const requireAuth = async (
  args: LoaderFunctionArgs | ActionFunctionArgs
) => {
  const { userId, ...user } = await getAuth(args)
  if (!userId) {
    throw redirect(`/sign-in?redirect_url=${args.request.url}`)
  }
  return { userId, ...user }
}
