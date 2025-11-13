'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { StyleTheme } from '@/types/game';

interface ThemeContextType {
  theme: StyleTheme | null;
  themeName: string;
  isLoading: boolean;
  error: string | null;
  refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: null,
  themeName: 'Default',
  isLoading: true,
  error: null,
  refreshTheme: async () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<StyleTheme | null>(null);
  const [themeName, setThemeName] = useState<string>('Default');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTheme = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/api/theme`);
      
      if (!response.ok) {
        throw new Error('Failed to load theme');
      }

      const data = await response.json();
      setTheme(data.theme);
      setThemeName(data.name || 'Default');
      
      // Apply theme to CSS custom properties
      applyThemeToDOM(data.theme);
    } catch (err) {
      console.error('Error loading theme:', err);
      setError(err instanceof Error ? err.message : 'Failed to load theme');
      // Apply default theme on error
      applyDefaultTheme();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyThemeToDOM = (themeData: StyleTheme) => {
    const root = document.documentElement;
    
    // Set CSS custom properties
    root.style.setProperty('--color-primary', themeData.primary);
    root.style.setProperty('--color-primary-light', themeData.primaryLight);
    root.style.setProperty('--color-primary-dark', themeData.primaryDark);
    root.style.setProperty('--color-secondary', themeData.secondary);
    root.style.setProperty('--color-secondary-light', themeData.secondaryLight);
    root.style.setProperty('--color-secondary-dark', themeData.secondaryDark);
    root.style.setProperty('--color-accent-blue', themeData.accentBlue);
    root.style.setProperty('--color-accent-orange', themeData.accentOrange);
    root.style.setProperty('--color-accent-green', themeData.accentGreen);
    root.style.setProperty('--color-accent-yellow', themeData.accentYellow);
    
    if (themeData.background) {
      root.style.setProperty('--theme-background', themeData.background);
    } else {
      root.style.removeProperty('--theme-background');
    }
    
    if (themeData.pattern) {
      root.style.setProperty('--theme-pattern', themeData.pattern);
    } else {
      root.style.removeProperty('--theme-pattern');
    }
  };

  const applyDefaultTheme = () => {
    const defaultTheme: StyleTheme = {
      primary: '#46178F',
      primaryLight: '#6938A5',
      primaryDark: '#2D0E5A',
      secondary: '#E21B3C',
      secondaryLight: '#FF4560',
      secondaryDark: '#B31530',
      accentBlue: '#1368CE',
      accentOrange: '#FF8C1A',
      accentGreen: '#26890D',
      accentYellow: '#FFD602',
    };
    
    setTheme(defaultTheme);
    setThemeName('Default');
    applyThemeToDOM(defaultTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeName,
        isLoading,
        error,
        refreshTheme: loadTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
