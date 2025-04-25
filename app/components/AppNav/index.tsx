import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser
} from '@clerk/remix'
import { NavLink } from '@remix-run/react'
import ThemePicker from '~/components/ThemePicker'

const AppNav = ({ minimal = false }) => {
  const { isSignedIn } = useUser()

  return (
    <div className="navbar bg-base-300 text-base-content mb-4 pr-4 gap-2">
      <div className="flex-1">
        <NavLink
          to={isSignedIn ? '/games' : '/'}
          className="btn btn-ghost text-xl"
        >
          Unquestable
        </NavLink>
      </div>
      {!minimal && (
        <>
          <SignedIn>
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
          </SignedIn>
          <div className="flex-none">
            <ThemePicker />
          </div>
          <UserButton userProfileMode="navigation" userProfileUrl="/user" />
          <SignedOut>
            <SignInButton />
          </SignedOut>
        </>
      )}
    </div>
  )
}

export default AppNav
