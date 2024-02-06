import clsx from 'clsx'
import type { ChangeEventHandler, ForwardedRef, PropsWithChildren, ReactNode} from 'react';
import { forwardRef } from 'react'
import { useField } from 'remix-validated-form'
import RequiredIndicator from '../RequiredIndicator'

type Props = PropsWithChildren<{
  name: string
  label?: ReactNode
  required?: boolean
  hintLeft?: ReactNode
  hintRight?: ReactNode
  value?: string | number | readonly string[]
  onChange?: ChangeEventHandler<HTMLSelectElement>
  multiple?: boolean
}>

const SelectInput = forwardRef(({
  name,
  label,
  required,
  hintLeft,
  hintRight,
  children,
  value,
  onChange,
  multiple
}: Props, ref: ForwardedRef<HTMLSelectElement>) => {
  const { getInputProps, error } = useField(name)

  return (
    <label className="form-control w-full max-w-xs">
      <div className="label">
        <span className="label-text">
          {required && <RequiredIndicator />}
          {label}
        </span>
      </div>
      <select
        className={clsx('select select-bordered', error && 'select-error')}
        {...getInputProps({
          id: name,
          value,
          onChange,
          multiple
        })}
        ref={ref}
      >
        {children}
      </select>
      <div className="label">
        {error ? (
          <>
            <span className="label-text-alt text-error">{error}</span>
          </>
        ) : (
          <>
            <span className="label-text-alt">{hintLeft}</span>
            <span className="label-text-alt">{hintRight}</span>
          </>
        )}
      </div>
    </label>
  )
})

SelectInput.displayName = 'SelectInput'

export default SelectInput