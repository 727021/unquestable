import { SignUp } from '@clerk/react-router'

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
