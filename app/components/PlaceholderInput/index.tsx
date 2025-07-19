import type { FormApi } from '@rvf/react-router'
import RequiredIndicator from '~/components/RequiredIndicator'
import clsx from 'clsx'
import { useState, type ChangeEventHandler, type ElementRef } from 'react'
import type { loader as resolveLoader } from '~/routes/_app.games.$game.resolve.$mission._index'
import type { useLoaderData } from 'react-router'
import type { JsonObject } from '@prisma/client/runtime/library'

type Placeholder = ReturnType<
  typeof useLoaderData<typeof resolveLoader>
>['mission']['rewardPlaceholders'][0]

type Props = {
  index: number
  placeholder: Placeholder
  onChange?: ChangeEventHandler<ElementRef<'input'>>
  formApi: FormApi<any>
}

const PlaceholderInput = ({ index, placeholder, onChange, formApi }: Props) => {
  const name = `placeholders[${index}].value`

  const error = formApi.error(name)

  const [value, setValue] = useState(false)

  if (placeholder.type === 'boolean') {
    return (
      <fieldset className="fieldset max-w-full w-96">
        <label className="label justify-start gap-1">
          <input
            className={clsx('checkbox', error && 'checkbox-error')}
            type="checkbox"
            checked={value}
            onChange={(e) => {
              setValue(e.target.checked)
              onChange?.(e)
            }}
          />
          <span className="text-base-content">
            <RequiredIndicator />
            {placeholder.label}
          </span>
        </label>
        <input
          {...formApi.getInputProps(name, {
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
      </fieldset>
    )
  }

  console.log(placeholder)

  return (
    <fieldset className="fieldset max-w-full w-96">
      <label className="label">
        <span className="text-base-content">
          <RequiredIndicator />
          {placeholder.label}
        </span>
      </label>
      <input
        className={clsx('input w-full', error && 'input-error')}
        {...formApi.getInputProps(name, {
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
      <label className="label">
        {error && <span className="label-text-alt text-error">{error}</span>}
      </label>
    </fieldset>
  )
}

export default PlaceholderInput
