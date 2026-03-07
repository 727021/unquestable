import { useId } from 'react'
import type {
  ChangeEvent,
  ComponentRef,
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

  const onChange = (e: ChangeEvent<ComponentRef<'input'>>) => {
    field.setValue(e.target.checked ? 'RANDOM' : [])
    field.clearError()
  }

  const id = useId()

  return (
    <fieldset className="fieldset max-w-full w-96">
      <label className="label flex justify-between" htmlFor={`${id}-${name}`}>
        <span className="text-base-content">
          <RequiredIndicator />
          Side Mission{count > 1 ? 's' : ''}
        </span>
        <label
          className="label cursor-pointer p-0 gap-1"
          htmlFor={`${id}-${name}-random`}
        >
          <span className="text-base-content">Random?</span>
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={random}
            onChange={onChange}
            id={`${id}-${name}-random`}
          />
        </label>
      </label>
      <select
        className={clsx('select w-full', error && 'select-error')}
        {...(random
          ? { multiple: count > 1, disabled: true }
          : field.getInputProps({
              id: `${id}-${name}`,
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
    </fieldset>
  )
}

export default SideMissionsInput
