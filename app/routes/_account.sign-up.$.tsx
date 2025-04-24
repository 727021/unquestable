import { SignUp } from '@clerk/remix'

export default function Page() {
  return (
    <SignUp
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
