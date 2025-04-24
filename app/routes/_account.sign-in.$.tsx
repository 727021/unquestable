import { SignIn } from "@clerk/remix"

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