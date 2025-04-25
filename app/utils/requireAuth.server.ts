import { getAuth } from '@clerk/remix/ssr.server'
import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'

export const requireAuth = async (
  args: LoaderFunctionArgs | ActionFunctionArgs
) => {
  const { userId, ...user } = await getAuth(args)
  if (!userId) {
    throw redirect(`/sign-in?redirect_url=${args.request.url}`)
  }
  return { userId, ...user }
}
