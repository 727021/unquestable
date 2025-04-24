import type { LoaderFunction } from '@vercel/remix'
import { Outlet, redirect } from '@remix-run/react'
import Footer from '~/components/Footer'
import AppNav from '~/components/AppNav'
import { getAuth } from '@clerk/remix/ssr.server'
import { SignedIn } from '@clerk/remix'

export const loader: LoaderFunction = async (args) => {
  const { userId } = await getAuth(args)
  if (!userId) {
    return redirect(`/sign-in?redirect_url=${args.request.url}`)
  }
  return {}
}

const App = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AppNav />
      <main className="grow max-w-screen-xl w-full mx-auto">
        <SignedIn>
          <Outlet />
        </SignedIn>
      </main>
      <Footer />
    </div>
  )
}

export default App
