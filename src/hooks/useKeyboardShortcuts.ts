import { useEffect } from "react";
import { KEYBOARD_SHORTCUTS } from "@/config/constants";

interface ShortcutHandlers {
  onClearLogs: () => void;
  onFocusPrompt: () => void;
  onToggleTheme: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { FOCUS_PROMPT, CLEAR_LOGS, TOGGLE_THEME } = KEYBOARD_SHORTCUTS;
      
      if ((e.metaKey || e.ctrlKey) && e.key === FOCUS_PROMPT.key) {
        e.preventDefault();
        handlers.onFocusPrompt();
      }
      // Add other shortcuts similarly
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers]);
}
