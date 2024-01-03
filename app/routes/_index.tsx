import type { MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'

export const meta: MetaFunction = () => {
  return [
    { title: 'Unquestable' }
  ]
}

export default function Index() {
  return (
    <div>
      <h1>Unquestable</h1>
      <Link to="/app">App &rarr;</Link>
    </div>
  )
}