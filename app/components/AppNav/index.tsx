import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser
} from '@clerk/react-router'
import { NavLink, useNavigation } from 'react-router'
import ThemePicker from '~/components/ThemePicker'

const AppNav = ({ minimal = false }) => {
  const { isSignedIn } = useUser()

  const { location } = useNavigation()
  const isNavigating = !!location

  return (
    <div className="navbar bg-base-300 text-base-content mb-4 pr-4 gap-2 relative">
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
      {isNavigating && (
        <progress className="progress progress-primary absolute left-0 bottom-0 bg-transparent h-0.5" />
      )}
    </div>
  )
}

export default AppNav
