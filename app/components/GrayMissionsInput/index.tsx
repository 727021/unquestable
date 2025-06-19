import clsx from 'clsx'
import type { ChangeEvent, PropsWithChildren } from 'react'
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

  return (
    <label className="form-control w-full max-w-xs">
      <div className="label">
        <span className="label-text">
          <RequiredIndicator />
          Gray Side Missions
        </span>
        <span className="label-text-alt">
          <div className="form-control">
            <label className="label cursor-pointer p-0 gap-1">
              <span className="label-text">Random?</span>
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={field.value() === 'RANDOM'}
                onChange={onChange}
              />
            </label>
          </div>
        </span>
      </div>
      <select
        className={clsx('select select-bordered', error && 'select-error')}
        {...formApi.getInputProps(name, {
          id: 'grayMissions',
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
    </label>
  )
}

export default GrayMissionsInput
