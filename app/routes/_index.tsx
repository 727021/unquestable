import type { MetaFunction } from '@vercel/remix'
import { Link } from '@remix-run/react'

export const meta: MetaFunction = () => {
  return [{ title: 'Unquestable' }]
}

export default function Index() {
  return (
    <div className="prose">
      <h1>Unquestable</h1>
      <Link to="/games">App &rarr;</Link>
    </div>
  )
}
