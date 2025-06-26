import type {
  ChangeEvent,
  ElementRef,
  ComponentProps,
  PropsWithChildren
} from 'react'
import RequiredIndicator from '../RequiredIndicator'
import type { FormApi } from '@rvf/react-router'
import clsx from 'clsx'

type Props = PropsWithChildren<
  {
    name: string
    count?: number
    formApi: FormApi<any>
  } & ComponentProps<'input'>
>

const SideMissionsInput = ({ name, count = 1, children, formApi }: Props) => {
  const field = formApi.field(name)
  const error = field.error()
  const random = field.value() === 'RANDOM'

  const onChange = (e: ChangeEvent<ElementRef<'input'>>) => {
    field.setValue(e.target.checked ? 'RANDOM' : [])
    field.clearError()
  }

  return (
    <label className="form-control w-full max-w-xs">
      <div className="label">
        <span className="label-text">
          <RequiredIndicator />
          Side Mission{count > 1 ? 's' : ''}
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
        {...(random
          ? { multiple: count > 1, disabled: true }
          : field.getInputProps({
              id: name,
              multiple: count > 1
            }))}
      >
        {children}
      </select>
      <div className="label">
        {(error || (field.value() !== 'RANDOM' && count > 1)) && (
          <span className={clsx('label-text-alt', error && 'text-error')}>
            Choose exactly {count} mission{count > 1 ? 's' : ''}
          </span>
        )}
      </div>
      {random && <input {...field.getHiddenInputProps()} />}
    </label>
  )
}

export default SideMissionsInput
