import type { PropsWithChildren} from 'react'
import { createContext, useContext, useLayoutEffect, useState } from 'react'

type ContextData = {
  theme: string,
  setTheme(newTheme: string): void
}

export const THEME_KEY = 'unquestable-theme'

export const ThemeContext = createContext<ContextData>({ theme: 'dark', setTheme() {} })

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [theme, _setTheme] = useState('dark')

  useLayoutEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_KEY)

    if (storedTheme) {
      _setTheme(storedTheme)
    }
  }, [])

  const setTheme = (newTheme: string) => {
    localStorage.setItem(THEME_KEY, newTheme)
    _setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
