import type { Fetcher } from '@remix-run/react'
import clsx from 'clsx'
import type { ComponentProps, PropsWithChildren } from 'react'
import { useIsSubmitting } from 'remix-validated-form'

type Props = PropsWithChildren<
  Omit<ComponentProps<'button'>, 'type'> & {
    formId?: string
    fetcher?: Fetcher
  }
>

const SubmitButton = ({
  children,
  disabled,
  className,
  formId,
  fetcher,
  ...props
}: Props) => {
  const isSubmitting = useIsSubmitting(formId)
  const isLoading = isSubmitting || fetcher?.state === 'loading'

  return (
    <button
      className={clsx('btn', className)}
      {...props}
      type="submit"
      disabled={disabled || isLoading}
    >
      {children}
      {isLoading && (
        <span className="loading loading-spinner loading-md"></span>
      )}
    </button>
  )
}

export default SubmitButton
