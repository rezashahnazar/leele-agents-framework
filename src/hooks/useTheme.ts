import { useTheme as useNextTheme } from "next-themes";
import { useEffect, useState } from "react";
import type { ThemeMode } from "@/types";
import { THEME_CONFIG } from "@/config/constants";

export function useTheme() {
  const { theme, setTheme, systemTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? theme : THEME_CONFIG.DEFAULT;
  const resolvedTheme = (
    currentTheme === "system" ? systemTheme : currentTheme
  ) as ThemeMode;

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return {
    theme: resolvedTheme === "system" ? "light" : resolvedTheme,
    toggleTheme,
    setTheme,
    mounted,
  };
}
