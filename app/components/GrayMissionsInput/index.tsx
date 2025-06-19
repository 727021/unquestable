import clsx from 'clsx'
import type { ChangeEvent, PropsWithChildren } from 'react'
import { useState } from 'react'
import type { FormApi } from '@rvf/react-router'
import RequiredIndicator from '../RequiredIndicator'

type Props = PropsWithChildren<{
  formApi: FormApi<any>
}>

const GrayMissionsInput = ({ children, formApi }: Props) => {
  const name = 'grayMissions'
  const error = formApi.error(name)

  const [random, setRandom] = useState(true)

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRandom(e.target.checked)
    formApi.clearError(name)
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
                checked={random}
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
          disabled: random
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
      {random && (
        <input
          {...formApi.getInputProps(name, {
            type: 'hidden',
            value: 'RANDOM'
          })}
        />
      )}
    </label>
  )
}

export default GrayMissionsInput
