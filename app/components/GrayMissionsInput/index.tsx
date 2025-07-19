import clsx from 'clsx'
import { useId, type ChangeEvent, type PropsWithChildren } from 'react'
import type { FormApi } from '@rvf/react-router'
import RequiredIndicator from '../RequiredIndicator'

type Props = PropsWithChildren<{
  formApi: FormApi<any>
}>

const GrayMissionsInput = ({ children, formApi }: Props) => {
  const name = 'grayMissions'
  const field = formApi.field(name)
  const error = field.error()

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    field.setValue(e.target.checked ? 'RANDOM' : [])
    field.clearError()
  }

  const id = useId()

  return (
    <div className="fieldset max-w-full w-96">
      <label
        className="label flex justify-between"
        htmlFor={`${id}-grayMissions`}
      >
        <span className="text-base-content">
          <RequiredIndicator />
          Gray Side Missions
        </span>
        <label
          className="label cursor-pointer p-0 gap-1"
          htmlFor={`${id}-random`}
        >
          <span className="text-base-content">Random?</span>
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={field.value() === 'RANDOM'}
            onChange={onChange}
            id={`${id}-random`}
          />
        </label>
      </label>
      <select
        className={clsx('select w-full', error && 'select-error')}
        {...formApi.getInputProps(name, {
          id: `${id}-grayMissions`,
          multiple: true,
          disabled: field.value() === 'RANDOM'
        })}
      >
        {children}
      </select>
      <div className="label">
        {error && (
          <>
            <span className="label-text-alt text-error">{error}</span>
          </>
        )}
      </div>
      {field.value() === 'RANDOM' && <input {...field.getHiddenInputProps()} />}
    </div>
  )
}

export default GrayMissionsInput
