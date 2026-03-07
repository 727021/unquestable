import { parseFormData, useForm } from '@rvf/react-router'
import { useState } from 'react'
import { ActionFunction, redirect, useFetcher } from 'react-router'
import z from 'zod'
import Modal from '~/components/Modal'
import { requireAuth } from '~/utils/requireAuth.server'
import { prisma } from '~/services/db.server'
import SubmitButton from '~/components/SubmitButton'

const schema = z.object({
  action: z.enum(['delete'])
})

export const action: ActionFunction = async (args) => {
  const { data } = await parseFormData(await args.request.formData(), schema)

  const { userId } = await requireAuth(args)
  const gameId = parseInt(args.params.game!, 10)

  switch (data?.action) {
    case 'delete': {
      await prisma.game.delete({
        where: {
          id: gameId,
          userId: userId
        }
      })

      return redirect('/games')
    }
  }

  throw new Response('Invalid action', { status: 400 })
}

const GameSettings = () => {
  const [deleting, setDeleting] = useState(false)

  const deleteFetcher = useFetcher()
  const deleteForm = useForm({
    schema,
    defaultValues: { action: 'delete' },
    fetcher: deleteFetcher,
    method: 'POST'
  })

  return (
    <>
      <div className="flex flex-col flex-1 gap-2">
        <h2 className="m-0">Settings</h2>
        <div className="w-2xl max-w-full no-underline border rounded-xs p-2">
          <div className="flex flex-col min-[400px]:flex-row gap-4 justify-between">
            <div className="flex flex-col">
              <h4 className="m-0 text-error">Delete Game</h4>
              <p className="text-sm text-error m-0 whitespace-pre-wrap">
                This will permanently delete the game and all associated data.
                This action cannot be undone.
              </p>
            </div>
            <button
              className="btn btn-outline btn-error btn-sm self-end"
              onClick={() => setDeleting(true)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      <Modal open={deleting} onClose={() => setDeleting(false)}>
        <form {...deleteForm.getFormProps()} className="flex flex-col gap-4">
          <input {...deleteForm.getHiddenInputProps('action')} />
          <h3 className="m-0">Confirm Deletion</h3>
          <p className="text-sm">
            Are you sure you want to delete this game? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => setDeleting(false)}
            >
              Cancel
            </button>
            <SubmitButton
              className="btn btn-outline btn-error"
              formApi={deleteForm}
              fetcher={deleteFetcher}
            >
              Delete Game
            </SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default GameSettings
