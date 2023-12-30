import type { MetaFunction } from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [
    { title: 'Unquestable' }
  ]
}

export default function Index() {
  return (
    <div>Hello, world!</div>
  )
}
