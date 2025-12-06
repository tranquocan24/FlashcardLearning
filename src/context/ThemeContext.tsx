import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { lightColors, darkColors, ColorTheme } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { storage } from '../utils/storage';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  colors: ColorTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app_theme_preference';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    loadSavedTheme();
  }, []);

  // Use system theme if no saved preference
  useEffect(() => {
    if (isInitialized) {
      return;
    }
    
    const loadInitialTheme = async () => {
      const savedTheme = await storage.getItem(THEME_STORAGE_KEY);
      if (!savedTheme && systemColorScheme) {
        setThemeState(systemColorScheme);
      }
      setIsInitialized(true);
    };

    loadInitialTheme();
  }, [systemColorScheme, isInitialized]);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await storage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    } finally {
      setIsInitialized(true);
    }
  };

  const setTheme = async (newTheme: ThemeMode) => {
    try {
      await storage.setItem(THEME_STORAGE_KEY, newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const colors = theme === 'dark' ? darkColors : lightColors;

  const value: ThemeContextType = {
    theme,
    colors,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
