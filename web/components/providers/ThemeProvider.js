import React, { useCallback, useEffect, useContext, useState, createContext } from 'react';

const ThemeContext = createContext({
  toggleTheme: _ => {},
  theme: null
});

const ThemeProvider = ({ children }) => {
  const context = useContext(ThemeContext);
  const [theme, setThemeState] = useState(context.theme);

  const toggleTheme = useCallback(_ => {
    setThemeState(theme === 'dark' ? 'light' : 'dark');
  }, [theme]);

  useEffect(() => {
    if (theme && typeof window !== undefined) {
      window.localStorage.setItem('__theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [theme]);

  useEffect(() => {
    const loadedTheme = window.localStorage.getItem('__theme');
    if (loadedTheme)
      setThemeState(loadedTheme)
  }, [])

  return (
    <ThemeContext.Provider value={{
      toggleTheme,
      theme
    }}>
      {children}
    </ThemeContext.Provider>
  )
};

export const useTheme = () => useContext(ThemeContext)

export default ThemeProvider
