import { useTheme } from '~/context/theme-context'
import tailwindConfig from '../../../tailwind.config'
import { ChevronDownIcon } from '@heroicons/react/24/solid'

const capitalize = (str: string) => str[0].toUpperCase() + str.slice(1)

const ThemePicker = () => {
  const { theme, setTheme } = useTheme()

  return (
    <div className="dropdown">
      <div tabIndex={0} role="button" className="btn m-1">
        Theme
        <ChevronDownIcon className="h-3 w-3 fill-current opacity-60 inline-block" />
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] p-2 shadow-2xl bg-base-300 rounded-box w-52 gap-1"
      >
        {tailwindConfig.daisyui.themes.map((themeName) => (
          <li key={themeName}>
            <input
              type="radio"
              name="theme-dropdown"
              className="theme-controller btn btn-sm btn-block btn-ghost justify-between"
              style={{ backgroundImage: 'none' }}
              aria-label={capitalize(themeName)}
              value={themeName}
              checked={themeName === theme}
              onChange={(e) => e.target.checked && setTheme(themeName)}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ThemePicker
