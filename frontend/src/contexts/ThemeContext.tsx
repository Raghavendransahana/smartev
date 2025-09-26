import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeName, themes } from '@/theme/themes';

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  changeTheme: (newTheme: ThemeName) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>('brandA');
  const [theme, setTheme] = useState<Theme>(themes.brandA);

  const changeTheme = async (newTheme: ThemeName) => {
    try {
      setThemeName(newTheme);
      setTheme(themes[newTheme]);
      await AsyncStorage.setItem('selectedTheme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Load saved theme on mount
  React.useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('selectedTheme');
        if (savedTheme && savedTheme in themes) {
          const themeKey = savedTheme as ThemeName;
          setThemeName(themeKey);
          setTheme(themes[themeKey]);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };

    loadSavedTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, themeName, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
