import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Default to light mode (false) so initial load is pure white
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('viotor_theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return false; // Default to false (light mode) instead of system prefers-color-scheme
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('viotor_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('viotor_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
