import type { ActionFunctionArgs, LoaderFunctionArgs} from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, useLoaderData, useNavigation } from '@remix-run/react'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { getUser } from '~/services/auth.server'
import { prisma } from '~/services/db.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request)

  const allExpansions = await prisma.expansion.findMany()
  const owned = (await prisma.expansion.findMany({
    where: {
      owners: {
        some: {
          id: user.id
        }
      }
    },
    select: {
      id: true
    }
  })).map(({ id }) => id)

  return json({ allExpansions, owned })
}

const addRemoveSchema = zfd.formData({
  expansionId: zfd.numeric(z.number().int().positive()),
  action: zfd.text(z.enum(['add','remove']))
})

export const action = async ({ request }: ActionFunctionArgs) => {
  const { action, expansionId } = addRemoveSchema.parse(
    await request.formData()
  )

  const user = await getUser(request)

  const expansion = await prisma.expansion.findUnique({
    where: {
      id: expansionId
    }
  })

  if (!expansion) {
    throw new Response(null, { status: 404 })
  }

  if (expansion.defaultOwned) {
    return new Response(null, { status: 204 })
  }

  await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      collection: {
        [action === 'add' ? 'connect' : 'disconnect']: {
          id: expansion.id
        }
      }
    }
  })

  return redirect(request.url)
}

const Collection = () => {
  const data = useLoaderData<typeof loader>()
  const navigation = useNavigation()

  return (
    <div>
      <h1>My Collection</h1>
      <ul>
        {data.allExpansions.map(expansion => (
          // TODO: pull this out into its own component and use a fetcher or submitter or whatever it's called
          <li key={expansion.id}>
            {data.owned.includes(expansion.id) ? '🟩' : '🟥'}
            {expansion.name}
            {!expansion.defaultOwned && (
              <Form method="POST">
                <input type="hidden" name="expansionId" value={expansion.id} />
                <input type="hidden" name="action" value={data.owned.includes(expansion.id) ? 'remove' : 'add'} />
                <button type="submit" disabled={navigation.state !== 'idle' && parseInt(navigation.formData?.get('expansionId')?.toString() ?? '-1', 10) === expansion.id}>{data.owned.includes(expansion.id) ? 'Remove' : 'Add'}</button>
              </Form>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Collection