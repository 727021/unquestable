import type { PropsWithChildren } from 'react'
import { useIsSubmitting } from 'remix-validated-form'

const SubmitButton = ({ children, ...props }: PropsWithChildren) => {
  const isSubmitting = useIsSubmitting()

  return (
    <button className="btn" {...props} type="submit" disabled={isSubmitting}>
      {children}
      {isSubmitting && (
        <span className="loading loading-spinner loading-md"></span>
      )}
    </button>
  )
}

export default SubmitButton
