import { useOutletContext } from '@remix-run/react'
import type { LoaderData as AppLoaderData } from './app'

const Index = () => {
  const outletData = useOutletContext<AppLoaderData>()
console.log('asdf')
  return (
    <div>
      <h1>Dashboard</h1>
      <pre>
        {JSON.stringify(outletData, null, 2)}
      </pre>
    </div>
  )
}

export default Index
