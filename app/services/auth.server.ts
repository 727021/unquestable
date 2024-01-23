import type { AppLoadContext } from '@remix-run/cloudflare'
import { Authenticator } from 'remix-auth'
import { DiscordStrategy } from 'remix-auth-discord'
import { getSessionStorage } from '~/services/session.server'

let _authenticator: Authenticator/*<User>*/

export const getAuthenticator = (context: AppLoadContext) => {
  if (!_authenticator) {
    _authenticator = new Authenticator/*<User>*/(getSessionStorage(context))

    const discordStrategy = new DiscordStrategy(
      {
        clientID: context.DISCORD_CLIENT_ID as string,
        clientSecret: context.DISCORD_CLIENT_SECRET as string,
        callbackURL: context.DISCORD_CALLBACK_URL as string
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
        // let user = await prisma.user.findUnique({ where: { discordId } })
        // if (!user) {
        //   const defaultCollection = await prisma.expansion.findMany({
        //     where: {
        //       defaultOwned: true
        //     }
        //   })
        //   user = await prisma.user.create({
        //     data: {
        //       discordId,
        //       displayName,
        //       discriminator,
        //       email,
        //       avatar,
        //       collection: {
        //         connect: defaultCollection.map(c => ({ id: c.id }))
        //       }
        //     }
        //   })
        // }
        const user = {
          discordId,
          displayName,
          discriminator,
          email,
          avatar,
          collection: []
        }
        return user
      }
    )

    _authenticator.use(discordStrategy)
  }

  return _authenticator
}

export const getUser = (request: Request, context: AppLoadContext) => getAuthenticator(context).isAuthenticated(request, { failureRedirect: '/login' })
