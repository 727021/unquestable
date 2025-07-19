import type { LoaderFunction, MetaFunction } from 'react-router'
import { Link, redirect } from 'react-router'
import AppNav from '~/components/AppNav'
import { getAuth } from '@clerk/react-router/ssr.server'

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
