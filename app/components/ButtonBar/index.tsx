import { useState, type ReactNode } from 'react'
import RequiredIndicator from '../RequiredIndicator'
import { useField } from 'remix-validated-form'
import clsx from 'clsx'

type Props = {
  required?: boolean
  label: ReactNode
  name: string
  options: {
    value: string | number
    label: ReactNode
  }[]
  onChange?: (value: string | number) => any
  defaultValue?: string | number
}

const ButtonBar = ({
  required,
  label,
  name,
  options,
  onChange,
  defaultValue
}: Props) => {
  const [value, setValue] = useState<string | number | undefined>(defaultValue)
  const { getInputProps, error } = useField(name)

  const handleClick = (value: string | number) => {
    setValue(value)
    onChange?.(value)
  }

  return (
    <div className="form-control">
      <div className="label">
        <span className="label-text">
          {required && <RequiredIndicator />}
          {label}
        </span>
      </div>
      <input
        {...getInputProps({
          id: name,
          type: 'hidden',
          value
        })}
      />
      <div className="flex flex-nowrap">
        {options.map((option, i) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleClick(option.value)}
            className={clsx(
              'btn btn-md btn-primary',
              value !== option.value && 'btn-outline',
              i !== 0 && 'rounded-l-none',
              i !== options.length - 1 && 'rounded-r-none'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="label">
        {error && <span className="label-text-alt text-error">{error}</span>}
      </div>
    </div>
    // <div className="form-control">
    //   <div className="label">
    //     <span className="label-text">
    //       <RequiredIndicator />
    //       Winner
    //     </span>
    //   </div>
    //   <input
    //     type="hidden"
    //     name="win"
    //     value={
    //       win === true ? Side.REBEL : win === false ? Side.IMPERIAL : undefined
    //     }
    //   />
    //   <div className="flex">
    //     <button
    //       type="button"
    //       onClick={() => setWin(false)}
    //       className={clsx(
    //         'btn btn-md btn-primary rounded-r-none',
    //         win !== false && 'btn-outline'
    //       )}
    //     >
    //       Empire
    //     </button>
    //     <button
    //       type="button"
    //       onClick={() => setWin(true)}
    //       className={clsx(
    //         'btn btn-md btn-primary rounded-l-none',
    //         win !== true && 'btn-outline'
    //       )}
    //     >
    //       Rebels
    //     </button>
    //   </div>
    // </div>
  )
}

export default ButtonBar
