import clsx from 'clsx'
import type { ChangeEvent, PropsWithChildren } from 'react'
import { useState } from 'react'
import { useField } from 'remix-validated-form'
import RequiredIndicator from '../RequiredIndicator'

const ChooseGrayMissions = ({ children }: PropsWithChildren) => {
  const { getInputProps, error, clearError } = useField('grayMissions')

  const [random, setRandom] = useState(true)

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRandom(e.target.checked)
    clearError()
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
        {...getInputProps({
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
      {random && <input type="hidden" value="RANDOM" {...getInputProps()} />}
    </label>
  )
}

export default ChooseGrayMissions
