import { Authenticator } from 'remix-auth'
import { DiscordStrategy } from 'remix-auth-discord'
import { sessionStorage } from '~/services/session.server'
import { prisma } from '~/services/db.server'
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
    let user = await prisma.user.findUnique({ where: { discordId } })
    if (!user) {
      const defaultCollection = await prisma.expansion.findMany({
        where: {
          defaultOwned: true
        }
      })
      user = await prisma.user.create({
        data: {
          discordId,
          displayName,
          discriminator,
          email,
          avatar,
          collection: {
            connect: defaultCollection.map(c => ({ id: c.id }))
          }
        }
      })
    }
    return user
  }
)

authenticator.use(discordStrategy)

export const getUser = (request: Request) => authenticator.isAuthenticated(request, { failureRedirect: '/login' })
