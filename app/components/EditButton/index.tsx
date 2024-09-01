import type { ElementRef, MouseEventHandler } from 'react'
import clsx from 'clsx'
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/solid'

type EditButtonProps = {
  onClick: MouseEventHandler<ElementRef<'button'>>
  active: boolean,
  hideLabel?: boolean,
  disabled?: boolean
}

const EditButton = ({ onClick, active, hideLabel, disabled }: EditButtonProps) => (
  <span className="flex gap-2 items-center">
    {active && !hideLabel && <p className="m-0 text-primary">Editing</p>}
    <button
      className={clsx(
        'swap swap-flip btn btn-ghost btn-circle btn-sm',
        active && 'swap-active'
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <PencilIcon className="swap-off w-5 h-5" />
      <XMarkIcon className="swap-on w-6 h-6" />
    </button>
  </span>
)

export default EditButton
