import { UserProfile } from '@clerk/remix'

export default function Page() {
  return (
    <UserProfile
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
