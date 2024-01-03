import { json, type LoaderFunction } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { authenticator } from '~/services/auth.server'
import { getSession } from '~/services/session.server'
import GoogleLoginButton from '~/components/GoogleLoginButton'

export const loader: LoaderFunction = async ({ request }) => {
  await authenticator.isAuthenticated(request, {
    successRedirect: '/app'
  })
  const session = await getSession(request.headers.get('cookie'))
  const error = session.get(authenticator.sessionErrorKey)
  return json({ error })
}

const Login = () => {
  const { error } = useLoaderData<typeof loader>()

  return (
    <>
      <Form action="/auth/google" method="post">
        <GoogleLoginButton />
      </Form>
      {error && (
        // TODO: Actual error handling
        <div>{error}</div>
      )}
    </>
  )
}

export default Login
