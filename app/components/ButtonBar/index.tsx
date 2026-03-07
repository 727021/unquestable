import { useState, type ReactNode } from 'react'
import RequiredIndicator from '../RequiredIndicator'
import type { FormApi } from '@rvf/react-router'
import clsx from 'clsx'

type Props = {
  required?: boolean
  label: ReactNode
  name: string
  options: {
    value: string | number
    label: ReactNode
  }[]
  onChange?: (value: string | number) => any
  formApi: FormApi<any>
}

const ButtonBar = ({
  required,
  label,
  name,
  options,
  onChange,
  formApi
}: Props) => {
  const field = formApi.field(name)
  const value = field.value()
  const error = field.error()

  const handleClick = (value: string | number) => {
    field.setValue(value)
    onChange?.(value)
  }

  return (
    <fieldset className="fieldset">
      <label className="label">
        <span className="text-base-content">
          {required && <RequiredIndicator />}
          {label}
        </span>
      </label>
      <input
        {...formApi.getInputProps(name, {
          id: name,
          type: 'hidden'
        })}
      />
      <div className="flex-nowrap join">
        {options.map((option, i) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleClick(option.value)}
            className={clsx(
              'btn btn-md btn-primary join-item',
              value !== option.value && 'btn-outline'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <label className="label">
        {error && <span className="text-error">{error}</span>}
      </label>
    </fieldset>
  )
}

export default ButtonBar
