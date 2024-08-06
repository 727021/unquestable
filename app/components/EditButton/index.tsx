import type { ElementRef, MouseEventHandler } from 'react';
import clsx from 'clsx'
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/solid'

type EditButtonProps = {
  onClick: MouseEventHandler<ElementRef<'button'>>
  active: boolean
}

const EditButton = ({ onClick, active }: EditButtonProps) => (
  <button
    className={clsx(
      'swap swap-flip btn btn-ghost btn-circle btn-sm',
      active && 'swap-active'
    )}
    onClick={onClick}
  >
    <PencilIcon className="swap-off w-5 h-5" />
    <XMarkIcon className="swap-on w-6 h-6" />
  </button>
)

export default EditButton
