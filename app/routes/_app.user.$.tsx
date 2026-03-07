import { UserProfile } from '@clerk/react-router'

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
