import { useField } from 'remix-validated-form'
import RequiredIndicator from '~/components/RequiredIndicator'
import clsx from 'clsx'
import { forwardRef } from 'react'
import type { ChangeEventHandler, ReactNode, ForwardedRef, ComponentProps } from 'react'

type Props = {
  name: string
  label: ReactNode
  required?: boolean
  hintLeft?: ReactNode
  hintRight?: ReactNode
  value?: string | number
  onChange?: ChangeEventHandler<HTMLInputElement>
} & ComponentProps<'input'>

const TextInput = forwardRef(
  (
    { name, label, required, hintLeft, hintRight, value, onChange, type = 'text', ...props }: Props,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    const { getInputProps, error } = useField(name)

    return (
      <label className="form-control max-w-full w-96">
        <div className="label">
          <span className="label-text">
            {required && <RequiredIndicator />}
            {label}
          </span>
        </div>
        <input
          className={clsx(
            'input input-bordered w-full',
            error && 'input-error'
          )}
          {...getInputProps({
            ...props,
            id: name,
            type,
            value,
            onChange
          })}
          ref={ref}
        />
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
  }
)

TextInput.displayName = 'TextInput'

export default TextInput
