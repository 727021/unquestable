import { Link, NavLink } from '@remix-run/react'
import ThemePicker from '~/components/ThemePicker'
import type { getUser } from '~/services/auth.server'
import { getAvatarUrls } from '~/utils/avatar'

type Props = {
  user: Awaited<ReturnType<typeof getUser>>
}

const AppNav = ({ user }: Props) => {
  const urls = getAvatarUrls(user, 32)

  return (
    <div className="navbar bg-base-300 text-base-content mb-4">
      <div className="flex-1">
        <NavLink to="/home" className="btn btn-ghost text-xl">
          Unquestable
        </NavLink>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li>
            <NavLink to="/collection">Collection</NavLink>
          </li>
          <li>
            <NavLink to="/games" end>
              Games
            </NavLink>
          </li>
        </ul>
      </div>
      <div className="flex-none">
        <ThemePicker />
      </div>
      <div className="flex-none dropdown dropdown-end">
        <button className="btn btn-ghost btn-circle avatar">
          <div className="w-8 rounded-full">
            <picture>
              {urls.webp && <source src={urls.webp} />}
              <img src={urls.gif ?? urls.png} alt="" />
            </picture>
          </div>
        </button>
        <ul
          tabIndex={0}
          className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-300 text-base-content rounded-box w-52"
        >
          <li>
            <NavLink to="/profile">Profile</NavLink>
          </li>
          <li>
            <Link to="/logout">Log Out</Link>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default AppNav
