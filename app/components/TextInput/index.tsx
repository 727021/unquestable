import { useField } from '@rvf/react-router'
import RequiredIndicator from '~/components/RequiredIndicator'
import clsx from 'clsx'
import { forwardRef } from 'react'
import type {
  ChangeEventHandler,
  ReactNode,
  ForwardedRef,
  ComponentProps
} from 'react'

type Props = {
  name: string
  label: ReactNode
  required?: boolean
  hintLeft?: ReactNode
  hintRight?: ReactNode
  value?: string | number
  onChange?: ChangeEventHandler<HTMLInputElement>
  inline?: boolean
  formId?: string
} & ComponentProps<'input'>

const TextInput = forwardRef(
  (
    {
      name,
      label,
      required,
      hintLeft,
      hintRight,
      value,
      onChange,
      type = 'text',
      inline,
      formId,
      ...props
    }: Props,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    const { getInputProps, error } = useField(name, { formId })

    return (
      <label
        className={clsx(
          'form-control max-w-full w-fit sm:w-96',
          inline && 'flex-row items-center',
          type === 'number' && 'sm:w-fit'
        )}
      >
        <div className={clsx('label', inline && 'py-0')}>
          <span className={clsx(typeof label === 'string' && 'label-text')}>
            {required && <RequiredIndicator />}
            {label}
          </span>
        </div>
        <input
          className={clsx(
            'input input-bordered w-full',
            error && 'input-error',
            inline && 'input-sm'
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
