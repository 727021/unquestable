import type { PropsWithChildren, Dispatch, SetStateAction } from 'react'
import { createContext, useContext, useLayoutEffect, useState } from 'react'

type Themes = 'light' | 'dark'

type ContextData = {
  theme: string
  setTheme: Dispatch<SetStateAction<Themes>>
}

export const THEME_KEY = 'unquestable-theme'

export const ThemeContext = createContext<ContextData>({
  theme: 'dark',
  setTheme() {}
})

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [theme, _setTheme] = useState<Themes>('dark')

  useLayoutEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_KEY)

    if (storedTheme) {
      _setTheme(storedTheme as Themes)
    }
  }, [])

  const setTheme: typeof _setTheme = (newTheme) => {
    if (typeof newTheme === 'string') {
      localStorage.setItem(THEME_KEY, newTheme)
      _setTheme(newTheme)
    } else {
      _setTheme(prev => {
        const t = newTheme(prev)
        localStorage.setItem(THEME_KEY, t)
        return t
      })
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
