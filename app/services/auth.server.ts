import { Authenticator } from 'remix-auth'
import { GoogleStrategy } from 'remix-auth-google'
import { sessionStorage } from '~/services/session.server'
import { User } from '~/services/db.server'
import type { Prisma } from '@prisma/client'

export const authenticator = new Authenticator<Prisma.UserGetPayload<null>>(sessionStorage)

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL ?? `https://${process.env.VERCEL_URL}/auth/google/callback`
  },
  async ({ profile }) => {
    const {
      id: googleId,
      emails: [{ value: email }],
      displayName
    } = profile
    const user =
      await User.findUnique({ where: { googleId } }) ??
      await User.create({ data: { googleId, displayName, email } })
    return user
  }
)

authenticator.use(googleStrategy)
