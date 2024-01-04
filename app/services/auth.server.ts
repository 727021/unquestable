import { Authenticator } from 'remix-auth'
import { DiscordStrategy } from 'remix-auth-discord'
import { sessionStorage } from '~/services/session.server'
import { User } from '~/services/db.server'
import type { Prisma } from '@prisma/client'

export const authenticator = new Authenticator<Prisma.UserGetPayload<null>>(sessionStorage)

const discordStrategy = new DiscordStrategy(
  {
    clientID: process.env.DISCORD_CLIENT_ID!,
    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    callbackURL: process.env.DISCORD_CALLBACK_URL!
  },
  async ({ profile }) => {
    const {
      id: discordId,
      displayName,
      __json: {
        avatar,
        email,
        discriminator
      }
    } = profile
    const user =
      await User.findUnique({ where: { discordId } }) ??
      await User.create({ data: { discordId, displayName, discriminator, email, avatar } })
    return user
  }
)

authenticator.use(discordStrategy)
