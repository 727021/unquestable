import { Outlet } from 'react-router'
import AppNav from '~/components/AppNav'
import Footer from '~/components/Footer'

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppNav minimal />
      <main className="grow max-w-screen-xl w-full mx-auto">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
