import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import CollectionItem from '~/components/CollectionItem'
import { getUser } from '~/services/auth.server'
import { prisma } from '~/services/db.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request)

  const allExpansions = await prisma.expansion.findMany({
    include: { boxArt: true }
  })
  const owned = (
    await prisma.expansion.findMany({
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
    })
  ).map(({ id }) => id)

  return json({ allExpansions, owned })
}

const addRemoveSchema = zfd.formData({
  expansionId: zfd.numeric(z.number().int().positive()),
  action: zfd.text(z.enum(['add', 'remove']))
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

  return json({
    owned: action === 'add'
  })
}

const Collection = () => {
  const data = useLoaderData<typeof loader>()

  return (
    <div>
      <h1>My Collection</h1>
      <div className="flex flex-wrap justify-around gap-4 p-2">
        {data.allExpansions.map((expansion) => (
          <CollectionItem
            key={expansion.id}
            expansion={expansion}
            owned={data.owned.includes(expansion.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default Collection
