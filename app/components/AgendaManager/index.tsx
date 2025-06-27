import { useFetcher } from 'react-router'
import { useEffect, useId, useState } from 'react'
import type { LoaderData } from '~/routes/_app.games.$game'
import EditButton from '~/components/EditButton'
import { useForm } from '@rvf/react-router'
import {
  ActionData,
  agendaSchema
} from '~/routes/_app.games.$game.empire.agendas'
import { PlusIcon } from '@heroicons/react/24/solid'
import {
  ArrowDownCircleIcon,
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon
} from '@heroicons/react/24/outline'
import SubmitButton from '~/components/SubmitButton'
import { Agenda } from '@prisma/client'

type Props = {
  imperialPlayer: NonNullable<LoaderData['game']['imperialPlayer']>
  formAction?: string
}

const AgendaManager = ({ imperialPlayer, formAction }: Props) => {
  const fetcher = useFetcher<ActionData>()

  const [editing, setEditing] = useState(false)

  const formId = useId()
  const form = useForm({
    submitSource: 'state',
    id: formId,
    schema: agendaSchema,
    method: 'POST',
    action: formAction,
    fetcher,
    defaultValues: {
      agendas: imperialPlayer.agendas.map((agenda) => ({
        id: agenda.agendaId,
        discarded: agenda.discarded
      }))
    }
  })

  const cancel = () => {
    setEditing(false)
    form.resetForm({
      agendas: imperialPlayer.agendas.map((agenda) => ({
        id: agenda.agendaId,
        discarded: agenda.discarded
      }))
    })
  }

  const toggle = () => {
    setEditing((prev) => !prev)
    form.resetForm({
      agendas: imperialPlayer.agendas.map((agenda) => ({
        id: agenda.agendaId,
        discarded: agenda.discarded
      }))
    })
  }

  const allAgendas = imperialPlayer.agendaDecks.flatMap((deck) => deck.agendas)

  const [availableAgendas, ownedAgendas, discardedAgendas] = allAgendas.reduce<
    [Agenda[], Agenda[], Agenda[]]
  >(
    ([available, owned, discarded], agenda) => {
      const foundAgenda = form.value('agendas')?.find((a) => a.id === agenda.id)
      if (foundAgenda?.discarded) {
        discarded.push(agenda)
      } else if (foundAgenda) {
        owned.push(agenda)
      } else {
        available.push(agenda)
      }
      return [available, owned, discarded]
    },
    [[], [], []]
  )

  const [agenda, setAgenda] = useState(-1)

  const add = () => {
    if (!availableAgendas.some((a) => a.id === agenda)) {
      return
    }
    form.setValue('agendas', [
      ...(form.value('agendas') ?? []),
      { id: agenda, discarded: false }
    ])
    setAgenda(-1)
  }

  const discard = (agendaId: number) => {
    form.setValue(
      'agendas',
      form
        .value('agendas')
        ?.map((a) =>
          a.id === agendaId ? { id: agendaId, discarded: true } : a
        )
    )
  }

  const restore = (agendaId: number) => {
    form.setValue(
      'agendas',
      form
        .value('agendas')
        ?.map((a) =>
          a.id === agendaId ? { id: agendaId, discarded: false } : a
        )
    )
  }

  const reshuffle = (agendaId: number) => {
    form.setValue(
      'agendas',
      form.value('agendas')?.filter((a) => a.id !== agendaId)
    )
  }

  useEffect(() => {
    if (fetcher?.data?.success && fetcher.state === 'idle') {
      // Exit edit mode after data is refreshed if the last submission was successful
      cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher?.state])

  return (
    <div className="flex flex-col flex-1 px-2 pb-1 border rounded border-gray-400">
      <div className="flex justify-between items-center w-full">
        <h2 className="m-0">Agendas</h2>
        <EditButton
          active={editing}
          onClick={() => toggle()}
          disabled={
            fetcher?.state === 'loading' || fetcher?.state === 'submitting'
          }
        />
      </div>
      {editing ? (
        <form {...form.getFormProps()} className="flex flex-col flex-1">
          {form.renderFormIdInput()}
          <div className="flex flex-wrap">
            <div className="flex flex-col flex-1">
              <h3 className="m-0">Owned</h3>
              {!ownedAgendas.length && <p className="m-0">No Agendas</p>}
              {ownedAgendas
                .toSorted((a, b) => a.cost - b.cost)
                .map((agenda) => (
                  <div key={agenda.id} className="flex gap-1 items-center">
                    <p className="m-0">
                      {agenda.cost} - {agenda.name}
                    </p>
                    <button
                      className="btn btn-xs btn-circle btn-ghost tooltip"
                      data-tip="Reshuffle"
                      type="button"
                      onClick={() => reshuffle(agenda.id)}
                    >
                      <ArrowDownCircleIcon className="w-5 h-5" />
                    </button>
                    <button
                      className="btn btn-xs btn-circle btn-ghost tooltip"
                      data-tip="Discard"
                      type="button"
                      onClick={() => discard(agenda.id)}
                    >
                      <ArrowRightCircleIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
            </div>
            <div className="flex flex-col flex-1">
              <h3 className="m-0">Discarded</h3>
              {!discardedAgendas.length && <p className="m-0">No Agendas</p>}
              {discardedAgendas
                .toSorted((a, b) => a.cost - b.cost)
                .map((agenda) => (
                  <div key={agenda.id} className="flex gap-1 items-center">
                    <p className="m-0">
                      {agenda.cost} - {agenda.name}
                    </p>
                    <button
                      className="btn btn-xs btn-circle btn-ghost tooltip"
                      data-tip="Restore"
                      type="button"
                      onClick={() => restore(agenda.id)}
                    >
                      <ArrowLeftCircleIcon className="w-5 h-5" />
                    </button>
                    <button
                      className="btn btn-xs btn-circle btn-ghost tooltip"
                      data-tip="Reshuffle"
                      type="button"
                      onClick={() => reshuffle(agenda.id)}
                    >
                      <ArrowDownCircleIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
          <div className="flex flex-1 items-end justify-between">
            <div className="flex flex-col gap-2">
              <h3 className="m-0">Agenda Decks</h3>
              <div className="join">
                <select
                  className="join-item select select-bordered"
                  value={agenda}
                  onChange={(e) => setAgenda(parseInt(e.target.value, 10))}
                >
                  <option value={-1} disabled>
                    Choose an Agenda
                  </option>
                  {availableAgendas
                    .toSorted((a, b) => a.cost - b.cost)
                    .map((agenda) => (
                      <option key={agenda.id} value={agenda.id}>
                        {agenda.cost} - {agenda.name}
                      </option>
                    ))}
                </select>
                <button
                  className="btn join-item btn-outline"
                  type="button"
                  onClick={() => add()}
                  disabled={agenda === -1}
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            <SubmitButton
              className="btn btn-primary btn-outline"
              fetcher={fetcher}
              formApi={form}
            >
              Save
            </SubmitButton>
          </div>
          {form.value('agendas')?.map((_, i) => (
            <>
              <input {...form.getHiddenInputProps(`agendas[${i}].id`)} />
              <input {...form.getHiddenInputProps(`agendas[${i}].discarded`)} />
            </>
          ))}
        </form>
      ) : (
        <>
          <div className="flex flex-wrap">
            <div className="flex flex-col flex-1">
              <h3 className="m-0">Owned</h3>
              {!ownedAgendas.length ? (
                <p className="m-0">No Agendas</p>
              ) : (
                ownedAgendas
                  .toSorted((a, b) => a.cost - b.cost)
                  .map((agenda) => (
                    <p className="m-0" key={agenda.id}>
                      {agenda.cost} - {agenda.name}
                    </p>
                  ))
              )}
            </div>
            <div className="flex flex-col flex-1">
              <h3 className="m-0">Discarded</h3>
              {!discardedAgendas.length ? (
                <p className="m-0">No Agendas</p>
              ) : (
                discardedAgendas
                  .toSorted((a, b) => a.cost - b.cost)
                  .map((agenda) => (
                    <p className="m-0" key={agenda.id}>
                      {agenda.cost} - {agenda.name}
                    </p>
                  ))
              )}
            </div>
          </div>
          <div className="flex flex-col flex-1 justify-end">
            <h3 className="m-0">Agenda Decks</h3>
            <p className="m-0 whitespace-normal">
              {imperialPlayer.agendaDecks.map((deck) => deck.name).join(', ')}
            </p>
          </div>
        </>
      )}
    </div>
  )
}

export default AgendaManager
