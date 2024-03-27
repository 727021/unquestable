import clsx from 'clsx'
import type { ComponentProps, PropsWithChildren } from 'react'
import { useIsSubmitting } from 'remix-validated-form'

type Props = PropsWithChildren<Omit<ComponentProps<'button'>, 'type'>>

const SubmitButton = ({ children, disabled, className, ...props }: Props) => {
  const isSubmitting = useIsSubmitting()

  return (
    <button
      className={clsx('btn', className)}
      {...props}
      type="submit"
      disabled={disabled || isSubmitting}
    >
      {children}
      {isSubmitting && (
        <span className="loading loading-spinner loading-md"></span>
      )}
    </button>
  )
}

export default SubmitButton
