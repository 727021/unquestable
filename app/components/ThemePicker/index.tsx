import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { useTheme } from '~/context/theme-context'

const ThemePicker = () => {
  const { theme, setTheme } = useTheme()

  const toggle = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <button
      className={clsx(
        'swap swap-rotate btn btn-ghost btn-circle',
        theme === 'dark' && 'swap-active'
      )}
      onClick={toggle}
    >
      <SunIcon className="swap-off w-8 h-8" />
      <MoonIcon className="swap-on w-8 h-8" />
    </button>
  )
}

export default ThemePicker
