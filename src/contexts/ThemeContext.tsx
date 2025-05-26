import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  forceTheme: (theme: Theme | null) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    // Detecta preferência do SO
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });
  const [forcedTheme, setForcedTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // Sincroniza imediatamente ao montar
    const stored = localStorage.getItem('theme');
    const root = window.document.documentElement;
    if (stored === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const activeTheme = forcedTheme || theme;
    if (activeTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    if (!forcedTheme) {
      localStorage.setItem('theme', theme);
    }
  }, [theme, forcedTheme]);

  const setTheme = (newTheme: Theme) => setThemeState(newTheme);
  const toggleTheme = () => setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  const forceTheme = (t: Theme | null) => setForcedTheme(t);

  return (
    <ThemeContext.Provider value={{ theme: forcedTheme || theme, setTheme, toggleTheme, forceTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext deve ser usado dentro de ThemeProvider');
  return ctx;
}; 