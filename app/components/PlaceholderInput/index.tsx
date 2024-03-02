import { useField } from 'remix-validated-form'
import RequiredIndicator from '~/components/RequiredIndicator'
import clsx from 'clsx'
import { useState, type ChangeEventHandler, type ElementRef } from 'react'
import type { loader as resolveLoader } from '~/routes/_app.games.$game.resolve.$mission._index'
import type { useLoaderData } from '@remix-run/react'
import type { JsonObject } from '@prisma/client/runtime/library'

type Placeholder = ReturnType<
  typeof useLoaderData<typeof resolveLoader>
>['mission']['rewardPlaceholders'][0]

type Props = {
  index: number
  placeholder: Placeholder
  onChange?: ChangeEventHandler<ElementRef<'input'>>
}

const PlaceholderInput = ({ index, placeholder, onChange }: Props) => {
  const { getInputProps, error } = useField(`placeholders[${index}].value`)
  const [value, setValue] = useState(false)

  if (placeholder.type === 'boolean') {
    return (
      <label className="form-control max-w-full w-96">
        <div className="label">
          <RequiredIndicator />
          <span className="label-text">{placeholder.label}</span>
        </div>
        <input
          className={clsx('checkbox', error && 'checkbox-error')}
          type="checkbox"
          checked={value}
          onChange={(e) => {
            setValue(e.target.checked)
            onChange?.(e)
          }}
        />
        <input
          {...getInputProps({
            type: 'hidden',
            value: value ? 'true' : 'false'
          })}
        />
        <input
          type="hidden"
          name={`placeholders[${index}].id`}
          value={placeholder.id}
        />
        <input
          type="hidden"
          name={`placeholders[${index}].name`}
          value={placeholder.name}
        />
      </label>
    )
  }

  return (
    <label className="form-control max-w-full w-96">
      <div className="label">
        <span className="label-text">
          <RequiredIndicator />
          {placeholder.label}
        </span>
      </div>
      <input
        className={clsx('input input-bordered w-full', error && 'input-error')}
        {...getInputProps({
          onChange,
          type: placeholder.type,
          ...((placeholder.validation as JsonObject) ?? {})
        })}
      />
      <input
        type="hidden"
        name={`placeholders[${index}].id`}
        value={placeholder.id}
      />
      <input
        type="hidden"
        name={`placeholders[${index}].name`}
        value={placeholder.name}
      />
      <div className="label">
        {error && <span className="label-text-alt text-error">{error}</span>}
      </div>
    </label>
  )
}

export default PlaceholderInput
