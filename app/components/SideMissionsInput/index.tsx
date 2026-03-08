import { useId, useRef } from 'react'
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
  const multiple = count > 1

  const onRandomChange = (e: ChangeEvent<ComponentRef<'input'>>) => {
    field.setValue(
      e.target.checked
        ? 'RANDOM'
        : multiple
          ? []
          : [ref.current?.selectedOptions[0]?.value]
    )
    field.clearError()
  }

  const onMissionChange = (e: ChangeEvent<ComponentRef<'select'>>) => {
    const missions = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    )
    field.setValue(missions)
    field.clearError()
  }

  const id = useId()
  const ref = useRef<ComponentRef<'select'>>(null)

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
            onChange={onRandomChange}
            id={`${id}-${name}-random`}
          />
        </label>
      </label>
      <select
        className={clsx('select w-full', error && 'select-error')}
        multiple={multiple}
        disabled={random}
        id={`${id}-${name}`}
        onChange={onMissionChange}
        ref={ref}
      >
        {children}
      </select>
      <div className="label">
        {(error || (field.value() !== 'RANDOM' && multiple)) && (
          <span className={clsx('label-text-alt', error && 'text-error')}>
            Choose exactly {count} mission{multiple ? 's' : ''}
          </span>
        )}
      </div>
      {random ? (
        <input {...field.getHiddenInputProps()} />
      ) : (
        field
          .value()
          .map((value: string, index: number) => (
            <input
              key={value}
              {...formApi.getHiddenInputProps(`${name}[${index}]`)}
            />
          ))
      )}
    </fieldset>
  )
}

export default SideMissionsInput
