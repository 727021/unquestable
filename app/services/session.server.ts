import { createCookieSessionStorage } from '@remix-run/cloudflare'
import type { AppLoadContext, SessionData, SessionStorage } from '@remix-run/cloudflare'

let _sessionStorage: SessionStorage<SessionData, SessionData>

export const getSessionStorage = (context: AppLoadContext) => {
  if (!_sessionStorage) {
    _sessionStorage = createCookieSessionStorage({
      cookie: {
        name: '_session',
        sameSite: 'lax',
        path: '/',
        httpOnly: true,
        secrets: [context.SESSION_SECRET as string],
        secure: process.env.NODE_ENV === 'production'
      }
    })
  }

  return _sessionStorage
}
