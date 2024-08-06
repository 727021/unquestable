import clsx from 'clsx'
import type { ComponentProps, PropsWithChildren } from 'react'
import { useIsSubmitting } from 'remix-validated-form'

type Props = PropsWithChildren<Omit<ComponentProps<'button'>, 'type'> & { formId?: string }>

const SubmitButton = ({ children, disabled, className, formId, ...props }: Props) => {
  const isSubmitting = useIsSubmitting(formId)

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
