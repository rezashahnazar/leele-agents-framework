export const TOAST_CONFIG = {
  LIMIT: 1,
  REMOVE_DELAY: 1000000,
} as const;

export const THEME_CONFIG = {
  DEFAULT: "system",
  STORAGE_KEY: "theme-preference",
} as const;

export const KEYBOARD_SHORTCUTS = {
  FOCUS_PROMPT: { key: "k", ctrl: true },
  CLEAR_LOGS: { key: "l", ctrl: true },
  TOGGLE_THEME: { key: "d", ctrl: true },
} as const;

export const API_CONFIG = {
  MODEL: "gpt-4o-mini",
  TEMPERATURE: 0.7,
  MAX_TOKENS: 4096,
} as const;
