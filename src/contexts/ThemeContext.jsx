import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "civicai-theme";
const THEMES = ["gradient", "light", "dark", "warm", "gray"];
const ThemeContext = createContext(null);

function readTheme() {
  if (typeof window === "undefined") return "gradient";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return THEMES.includes(saved) ? saved : "gradient";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme, themes: THEMES }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
