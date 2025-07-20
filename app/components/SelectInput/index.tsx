import clsx from 'clsx'
import type {
  ChangeEventHandler,
  ForwardedRef,
  PropsWithChildren,
  ReactNode
} from 'react'
import { forwardRef } from 'react'
import type { FormApi } from '@rvf/react-router'
import RequiredIndicator from '../RequiredIndicator'

type Props = PropsWithChildren<{
  name: string
  label?: ReactNode
  labelRight?: ReactNode
  required?: boolean
  hintLeft?: ReactNode
  hintRight?: ReactNode
  value?: string | number | readonly string[]
  onChange?: ChangeEventHandler<HTMLSelectElement>
  multiple?: boolean
  disabled?: boolean
  formApi: FormApi<any>
}>

const SelectInput = forwardRef(
  (
    {
      name,
      label,
      required,
      hintLeft,
      hintRight,
      children,
      value,
      onChange,
      multiple,
      disabled,
      labelRight,
      formApi
    }: Props,
    ref: ForwardedRef<HTMLSelectElement>
  ) => {
    const error = formApi.error(name)

    return (
      <div className="fieldset max-w-full w-96">
        <label className="label flex justify-between">
          <span className="text-base-content">
            {required && <RequiredIndicator />}
            {label}
          </span>
          <span>{labelRight}</span>
        </label>
        <select
          className={clsx('select w-full', error && 'select-error')}
          {...formApi.getInputProps(name, {
            id: name,
            value,
            onChange,
            multiple,
            disabled,
            ref
          })}
        >
          {children}
        </select>
        <label className="label flex justify-between">
          {error ? (
            <>
              <span className="text-error">{error}</span>
            </>
          ) : (
            <>
              <span>{hintLeft}</span>
              <span>{hintRight}</span>
            </>
          )}
        </label>
      </div>
    )
  }
)

SelectInput.displayName = 'SelectInput'

export default SelectInput
