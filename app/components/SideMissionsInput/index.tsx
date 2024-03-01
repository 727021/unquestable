import type {
  ChangeEvent,
  ElementRef,
  ComponentProps,
  PropsWithChildren
} from 'react'
import { useState } from 'react'
import RequiredIndicator from '../RequiredIndicator'
import { useField } from 'remix-validated-form'
import clsx from 'clsx'

type Props = PropsWithChildren<
  {
    name: string
    count?: number
  } & ComponentProps<'input'>
>

const SideMissionsInput = ({ name, count = 1, children }: Props) => {
  const { getInputProps, error, clearError } = useField(name)

  const [random, setRandom] = useState(true)

  const onChange = (e: ChangeEvent<ElementRef<'input'>>) => {
    setRandom(e.target.checked)
    clearError()
  }

  return (
    <label className="form-control w-full max-w-xs">
      <div className="label">
        <span className="label-text">
          <RequiredIndicator />
          Side Missions
        </span>
        <span className="label-text-alt">
          <div className="form-control">
            <label className="label cursor-pointer p-0 gap-1">
              <span className="label-text">Random?</span>
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={random}
                onChange={onChange}
              />
            </label>
          </div>
        </span>
      </div>
      <select
        className={clsx('select select-bordered', error && 'select-error')}
        {...getInputProps({
          id: name,
          multiple: count > 1,
          disabled: random
        })}
      >
        {children}
      </select>
      <div className="label">
        {error && <span className="label-text-alt text-error">Choose exactly {count} mission{count > 1 ? 's' : ''}</span>}
      </div>
      {random && <input {...getInputProps({
        type: 'hidden',
        value: 'RANDOM'
      })} />}
    </label>
  )
}

export default SideMissionsInput
