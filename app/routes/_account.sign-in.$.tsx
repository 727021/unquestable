import { SignIn } from '@clerk/react-router'

export default function Page() {
  return (
    <SignIn
      appearance={{
        elements: {
          rootBox: {
            margin: '0 auto'
          }
        }
      }}
    />
  )
}
