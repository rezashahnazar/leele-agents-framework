"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Message } from "@/app/types";
import { LogsPanel } from "@/components/leele-agent-ui/LogsPanel";

export default function LeelEAgentUI() {
  const [userPrompt, setUserPrompt] = useState("");
  const [logs, setLogs] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Initialize theme based on system preference
  useEffect(() => {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(isDark ? "dark" : "light");
  }, []);

  // Handle keyboard shortcuts with custom hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("prompt")?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "l") {
        e.preventDefault();
        setLogs([]);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "d") {
        e.preventDefault();
        setTheme((t) => (t === "light" ? "dark" : "light"));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle system theme changes with custom hook
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Add this useEffect to handle theme class on html element
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const handleRunAgent = useCallback(async () => {
    if (!userPrompt.trim() || isLoading) return;

    setLogs([]);
    setIsLoading(true);

    const addLogWithTimestamp = (log: Omit<Message, "timestamp">) => {
      setLogs((prev) => [...prev, { ...log, timestamp: new Date() }]);
    };

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userPrompt }),
      });

      if (!response.body) {
        console.error("No response body");
        setIsLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let partialData = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        partialData += decoder.decode(value, { stream: true });

        const lines = partialData.split("\n");
        for (let i = 0; i < lines.length - 1; i++) {
          if (lines[i].startsWith("data:")) {
            try {
              const json = JSON.parse(
                lines[i].substring("data:".length).trim()
              );
              addLogWithTimestamp(json);
            } catch (error) {
              console.warn("Error parsing SSE data:", error);
            }
          }
        }
        partialData = lines[lines.length - 1];
      }
    } catch (error) {
      console.error("Error:", error);
      addLogWithTimestamp({
        id: crypto.randomUUID(),
        type: "error",
        message: "Failed to connect to the agent",
        theme,
      });
    } finally {
      setIsLoading(false);
    }
  }, [userPrompt, isLoading, theme]);

  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-background/40">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 shrink-0 bg-background/60 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
            <img src="/logo.svg" alt="LeelE" className="relative h-6 w-6" />
          </div>
          <div className="flex items-baseline space-x-2">
            <h1 className="text-xl font-bold animate-title-gradient">LeelE</h1>
            <div className="h-3 w-px bg-border/20" />
            <p className="text-sm font-medium text-muted-foreground/40 hidden sm:block">
              INTELLIGENT AGENT FRAMEWORK
            </p>
          </div>
        </div>
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="group relative inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent/50 transition-colors"
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          <div className="relative w-4 h-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`absolute inset-0 transition-all duration-500 ${
                theme === "light"
                  ? "scale-100 rotate-0 opacity-100"
                  : "scale-0 rotate-90 opacity-0"
              }`}
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`absolute inset-0 transition-all duration-500 ${
                theme === "dark"
                  ? "scale-100 rotate-0 opacity-100"
                  : "scale-0 -rotate-90 opacity-0"
              }`}
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          </div>
          <span className="sr-only">Toggle theme</span>
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <LogsPanel logs={logs} setLogs={setLogs} />
        </div>

        {/* Input area */}
        <div className="w-full bg-background/95 backdrop-blur-lg">
          <div className="p-4 mx-auto">
            <div className="flex gap-3 relative items-end">
              <div className="relative flex-1 group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-1000"></div>
                <div className="relative flex items-center bg-background/80 rounded-lg">
                  <textarea
                    id="prompt"
                    value={userPrompt}
                    onChange={(e) => {
                      const textarea = e.target;
                      textarea.style.height = "auto";
                      const newHeight = Math.min(textarea.scrollHeight, 200);
                      textarea.style.height = `${newHeight}px`;
                      setUserPrompt(e.target.value);
                    }}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    onKeyDown={(e) => {
                      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                        e.preventDefault();
                        handleRunAgent();
                      }
                    }}
                    placeholder="How can I assist you today?"
                    className={`w-full resize-none rounded-lg bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none min-h-[44px] overflow-y-hidden transition-opacity duration-200 ${
                      isLoading
                        ? "opacity-50 cursor-wait"
                        : "hover:bg-accent/10 focus:bg-accent/10"
                    }`}
                    rows={1}
                    autoComplete="off"
                    spellCheck="false"
                    disabled={isLoading}
                  />
                  {isInputFocused && !isLoading && (
                    <div className="absolute right-3 bottom-3 flex items-center gap-2 text-xs text-muted-foreground/60">
                      <kbd className="rounded bg-muted/50 px-1 py-0.5 text-[10px] font-medium">
                        ⌘
                      </kbd>
                      <kbd className="rounded bg-muted/50 px-1 py-0.5 text-[10px] font-medium">
                        ↵
                      </kbd>
                      <span className="mx-1">to send</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleRunAgent}
                disabled={isLoading || !userPrompt.trim()}
                className={`shrink-0 h-[44px] px-4 rounded-lg inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
                  isLoading
                    ? "bg-primary/70 text-primary-foreground/70 cursor-wait"
                    : userPrompt.trim()
                    ? "bg-primary/90 text-primary-foreground hover:bg-primary"
                    : "bg-primary/50 text-primary-foreground/50 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent opacity-70" />
                    <span className="text-xs animate-pulse">Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs">Ask AI</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      className={`transition-transform duration-200 ${
                        userPrompt.trim()
                          ? "translate-x-0 opacity-100"
                          : "-translate-x-1 opacity-0"
                      }`}
                    >
                      <path
                        d="M1.5 8h13m0 0L8 1.5M14.5 8L8 14.5"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
