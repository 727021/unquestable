import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'
import { useLoaderData } from 'react-router'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import CollectionItem from '~/components/CollectionItem'
import { prisma } from '~/services/db.server'
import { requireAuth } from '~/utils/requireAuth.server'

export const loader = async (args: LoaderFunctionArgs) => {
  const { userId } = await requireAuth(args)

  const allExpansions = await prisma.expansion.findMany({
    include: { boxArt: true }
  })
  const owned = (
    await prisma.expansion.findMany({
      where: {
        owners: {
          some: {
            id: userId
          }
        }
      },
      select: {
        id: true
      }
    })
  ).map(({ id }) => id)

  return { allExpansions, owned }
}

const addRemoveSchema = zfd.formData({
  expansionId: zfd.numeric(z.number().int().positive()),
  action: zfd.text(z.enum(['add', 'remove']))
})

export const action = async (args: ActionFunctionArgs) => {
  const { action, expansionId } = addRemoveSchema.parse(
    await args.request.formData()
  )

  const { userId } = await requireAuth(args)

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
      id: userId
    },
    data: {
      collection: {
        [action === 'add' ? 'connect' : 'disconnect']: {
          id: expansion.id
        }
      }
    }
  })

  return {
    owned: action === 'add'
  }
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
