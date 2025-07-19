import type { LoaderFunction } from 'react-router'
import { Outlet } from 'react-router'
import Footer from '~/components/Footer'
import AppNav from '~/components/AppNav'
import { SignedIn } from '@clerk/react-router'
import { requireAuth } from '~/utils/requireAuth.server'

export const loader: LoaderFunction = async (args) => {
  await requireAuth(args)
  return {}
}

const App = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AppNav />
      <main className="grow max-w-(--breakpoint-xl) w-full mx-auto">
        <SignedIn>
          <Outlet />
        </SignedIn>
      </main>
      <Footer />
    </div>
  )
}

export default App
