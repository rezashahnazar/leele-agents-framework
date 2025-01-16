import { useEffect, useRef } from "react";

export function useAutoResize() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleInput = () => adjustHeight();
    
    textarea.addEventListener("input", handleInput);
    
    // Initial height adjustment
    adjustHeight();

    return () => textarea.removeEventListener("input", handleInput);
  }, []);

  return { textareaRef, adjustHeight };
} 