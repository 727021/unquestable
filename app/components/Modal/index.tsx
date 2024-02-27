import clsx from 'clsx'
import {
  useRef,
  type ElementRef,
  type HTMLProps,
  type PropsWithChildren,
  type ReactEventHandler,
  useEffect
} from 'react'

type Props = PropsWithChildren<
  {
    open?: boolean
    onClose?: ReactEventHandler<ElementRef<'dialog'>>
  } & HTMLProps<ElementRef<'dialog'>>
>

const Modal = ({ children, open, onClose, ...props }: Props) => {
  const ref = useRef<ElementRef<'dialog'>>(null)

  useEffect(() => {
    if (open) {
      ref.current?.showModal()
    } else {
      ref.current?.close()
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className={clsx(props.className, 'modal')}
    >
      <div className="modal-box">{children}</div>
      <form
        action="dialog"
        className="modal-backdrop"
        onSubmit={(e) => {
          e.preventDefault()
          ref.current?.close()
        }}
      >
        <button type="submit">close</button>
      </form>
    </dialog>
  )
}

export default Modal
