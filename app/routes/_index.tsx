import type { LoaderFunction, MetaFunction } from '@vercel/remix'
import { Link, redirect } from '@remix-run/react'
import AppNav from '~/components/AppNav'
import { getAuth } from '@clerk/remix/ssr.server'

export const meta: MetaFunction = () => {
  return [{ title: 'Unquestable' }]
}

export const loader: LoaderFunction = async (args) => {
  const user = await getAuth(args)
  if (user.userId) {
    return redirect('/games')
  }
  return {}
}

export default function Index() {
  return (
    <>
      <AppNav />
      <div className="prose">
        <Link to="/games">App &rarr;</Link>
      </div>
    </>
  )
}
