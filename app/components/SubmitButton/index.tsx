import type { Fetcher } from 'react-router'
import clsx from 'clsx'
import type { ComponentProps, PropsWithChildren } from 'react'
import type { FormApi } from '@rvf/react-router'

type Props = PropsWithChildren<
  Omit<ComponentProps<'button'>, 'type'> & {
    formApi: FormApi<any>
    fetcher?: Fetcher
  }
>

const SubmitButton = ({
  children,
  disabled,
  className,
  formApi,
  fetcher,
  ...props
}: Props) => {
  const isSubmitting = formApi.formState.isSubmitting
  const isLoading = isSubmitting || fetcher?.state === 'loading'

  return (
    <button
      form={formApi.getFormProps().id}
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
