import { useField } from 'remix-validated-form'
import RequiredIndicator from '~/components/RequiredIndicator'
import clsx from 'clsx'
import type { ChangeEventHandler, ReactNode } from 'react'

type Props = {
  name: string
  label: ReactNode
  required?: boolean
  hintLeft?: ReactNode
  hintRight?: ReactNode
  value?: string
  onChange?: ChangeEventHandler<HTMLInputElement>
}

const TextInput = ({ name, label, required, hintLeft, hintRight, value, onChange }: Props) => {
  const { getInputProps, error } = useField(name)

  return (
    <label className="form-control w-full max-w-xs">
      <div className="label">
        <span className="label-text">
          {required && <RequiredIndicator />}
          {label}
        </span>
      </div>
      <input className={clsx('input input-bordered w-full max-w-xs', error && 'input-error')} {...getInputProps({ id: name, type: 'text', value, onChange })} />
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

export default TextInput
