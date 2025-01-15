"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Message } from "../../app/types";
import { LogsPanel } from "./LogsPanel";
import { ThemeProvider } from "@/lib/theme-context";

export default function AgentClientPage() {
  const [userPrompt, setUserPrompt] = useState("");
  const [logs, setLogs] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isInputFocused, setIsInputFocused] = useState(false);

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
  }, [userPrompt, isLoading]);

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "status":
        return (
          <svg
            className="w-5 h-5 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        );
      case "plan":
        return (
          <svg
            className="w-5 h-5 text-purple-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        );
      case "result":
        return (
          <svg
            className="w-5 h-5 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "refinement":
        return (
          <svg
            className="w-5 h-5 text-yellow-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            className="w-5 h-5 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <ThemeProvider theme={theme}>
      <div
        className={`min-h-screen transition-colors duration-500 ${
          theme === "dark" ? "bg-black" : "bg-white"
        }`}
      >
        <div className="relative h-screen overflow-hidden">
          {/* Magical AI Background Effect */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className={`absolute inset-0 opacity-20 transition-opacity duration-500 ${
                theme === "dark" ? "opacity-30" : "opacity-10"
              }`}
              style={{
                background: `
                  radial-gradient(circle at 0% 0%, ${
                    theme === "dark" ? "#1a1a1a" : "#f0f0f0"
                  } 0%, transparent 50%),
                  radial-gradient(circle at 100% 0%, ${
                    theme === "dark" ? "#2a2a2a" : "#ffffff"
                  } 0%, transparent 50%),
                  radial-gradient(circle at 50% 50%, ${
                    theme === "dark" ? "#303030" : "#fafafa"
                  } 0%, transparent 50%),
                  radial-gradient(circle at 0% 100%, ${
                    theme === "dark" ? "#202020" : "#f5f5f5"
                  } 0%, transparent 50%),
                  radial-gradient(circle at 100% 100%, ${
                    theme === "dark" ? "#252525" : "#ffffff"
                  } 0%, transparent 50%)
                `,
              }}
            >
              <div className="absolute inset-0 animate-pulse-slow mix-blend-overlay opacity-50" />
            </div>
          </div>

          <div className="relative h-full p-4 md:p-6 flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between mb-6 flex-shrink-0">
              <div className="flex items-center space-x-4">
                <h1
                  className={`text-xl md:text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r transition-all duration-500 ${
                    theme === "dark"
                      ? "from-blue-400 to-purple-400"
                      : "from-blue-600 to-purple-600"
                  }`}
                >
                  AI Agent
                </h1>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setTheme((t) => (t === "light" ? "dark" : "light"))
                    }
                    className={`p-1.5 rounded-full transition-colors duration-300 ${
                      theme === "dark"
                        ? "hover:bg-white/10"
                        : "hover:bg-black/5"
                    }`}
                    title="Toggle theme (⌘D)"
                  >
                    {theme === "light" ? "🌙" : "☀️"}
                  </button>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 min-h-0">
              {/* Input Panel */}
              <div
                className={`relative transition-all duration-500 rounded-2xl overflow-hidden ${
                  theme === "dark"
                    ? "bg-white/5 backdrop-blur-xl border border-white/10"
                    : "bg-black/5 backdrop-blur-xl border border-black/5"
                } ${isInputFocused ? "ring-2 ring-blue-500/30" : ""}`}
              >
                <div className="h-full flex flex-col p-4">
                  <div className="flex items-center justify-between mb-3 flex-shrink-0">
                    <label
                      htmlFor="prompt"
                      className={`text-xs font-medium transition-colors duration-300 ${
                        theme === "dark" ? "text-white/70" : "text-black/70"
                      }`}
                    >
                      Ask anything
                    </label>
                    <div className="text-[10px] opacity-50">⌘K to focus</div>
                  </div>
                  <div className="flex-1 flex flex-col min-h-0">
                    <textarea
                      id="prompt"
                      placeholder="How can I assist you today?"
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      onKeyDown={(e) => {
                        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                          e.preventDefault();
                          handleRunAgent();
                        }
                      }}
                      className={`flex-1 p-3 rounded-xl resize-none font-mono text-xs transition-colors duration-300 ${
                        theme === "dark"
                          ? "bg-black/20 text-white/90 placeholder-white/30"
                          : "bg-white/50 text-black/90 placeholder-black/30"
                      } focus:outline-none`}
                    />
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={handleRunAgent}
                      disabled={isLoading || !userPrompt.trim()}
                      className={`mt-3 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isLoading || !userPrompt.trim()
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:scale-[1.01] active:scale-[0.99]"
                      } ${
                        theme === "dark"
                          ? "bg-white/10 hover:bg-white/15 text-white"
                          : "bg-black/10 hover:bg-black/15 text-black"
                      }`}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        "Ask AI"
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Logs Panel */}
              <div className="relative flex flex-col min-h-0">
                <LogsPanel logs={logs} setLogs={setLogs} theme={theme} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
