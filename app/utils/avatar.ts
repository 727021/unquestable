
const cdn = 'https://cdn.discordapp.com'

const getDefaultAvatarIndex = (user: any/*Prisma.UserGetPayload<null>*/) => {
  const newUsernameSystem = user.discriminator === '0'
  const index = newUsernameSystem
    ? ((parseInt(user.discordId, 10) >> 22) % 6)
    : (parseInt(user.discriminator) % 5)
  return index
}

type AvatarUrls = {
  gif?: string
  png?: string
  webp?: string
}

export const getAvatarUrls = (user: any/*Prisma.UserGetPayload<null>*/, size = 32): AvatarUrls =>
  user.avatar?.startsWith('a_')
    ? { gif: `${cdn}/avatars/${user.discordId}/${user.avatar}.gif?size=${size}` }
    : user.avatar
      ? {
        webp: `${cdn}/avatars/${user.discordId}/${user.avatar}.webp?size=${size}`,
        png: `${cdn}/avatars/${user.discordId}/${user.avatar}.png?size=${size}`
      }
      : { png: `${cdn}/embed/avatars/${getDefaultAvatarIndex(user)}.png` }
