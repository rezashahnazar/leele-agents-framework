import React, { createContext, useContext } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    border: string;
  };
  transitions: {
    smooth: string;
    fast: string;
    slow: string;
  };
  blur: {
    none: string;
    sm: string;
    md: string;
    lg: string;
  };
  opacity: {
    low: string;
    medium: string;
    high: string;
  };
}

const getThemeValues = (theme: Theme): ThemeContextType => ({
  theme,
  colors: {
    primary: theme === "dark" ? "white" : "black",
    secondary: theme === "dark" ? "black" : "white",
    background:
      theme === "dark" ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)",
    text: theme === "dark" ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.9)",
    border:
      theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
  },
  transitions: {
    smooth: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
    fast: "all 150ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "all 500ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
  blur: {
    none: "backdrop-blur-none",
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
  },
  opacity: {
    low: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
    medium:
      theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    high: theme === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
  },
});

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  theme: Theme;
  children: React.ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const themeValues = getThemeValues(theme);

  return (
    <ThemeContext.Provider value={themeValues}>
      {children}
    </ThemeContext.Provider>
  );
}
