import type { ActionFunction } from '@remix-run/node'
import { Webhook } from 'svix'

const deleteUser = async (userId: string) => {
  // TODO: delete user from db

  return new Response(null, { status: 204 })
}

export const action: ActionFunction = async ({ request }) => {
  const svix = new Webhook(process.env.CLERK_WEBHOOK_SIGNING_SECRET ?? '')

  let hook

  try {
    hook = svix.verify(await request.text(), {
      'svix-id': request.headers.get('svix-id') ?? '',
      'svix-timestamp': request.headers.get('svix-timestamp') ?? '',
      'svix-signature': request.headers.get('svix-signature') ?? ''
    }) as
      | {
          type: 'user.deleted'
          data: {
            id: string
          }
        }
      | {
          type: ''
        }
  } catch (error) {
    return new Response(null, { status: 400 })
  }

  switch (hook.type) {
    case 'user.deleted': {
      return await deleteUser(hook.data.id)
    }
    default: {
      console.log('Unhandled webhook type:', hook.type)
      return new Response(null, { status: 400 })
    }
  }
}
