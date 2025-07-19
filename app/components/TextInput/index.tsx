import { FormApi } from '@rvf/react-router'
import RequiredIndicator from '~/components/RequiredIndicator'
import clsx from 'clsx'
import { forwardRef, useId } from 'react'
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
  formApi: FormApi<any>
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
      formApi: form,
      ...props
    }: Props,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    const error = form.error(name)
    const id = useId()

    return (
      <fieldset
        className={clsx(
          'fieldset max-w-full w-fit sm:w-96',
          inline && 'flex flex-row items-center',
          type === 'number' && 'sm:w-fit'
        )}
      >
        <label className={clsx('label text-base-content', inline && 'py-0')} htmlFor={id}>
            {required && <RequiredIndicator />}
            {label}
        </label>
        <input
          className={clsx(
            'input w-full',
            error && 'input-error',
            inline && 'input-sm'
          )}
          {...form.getInputProps(name, {
            ...props,
            id,
            type,
            value,
            onChange,
            ref
          })}
        />
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
      </fieldset>
    )
  }
)

TextInput.displayName = 'TextInput'

export default TextInput
