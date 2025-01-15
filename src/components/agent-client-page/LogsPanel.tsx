import React, { useState } from "react";
import { LogMessage } from "@/app/types";
import { Message } from "@/components/ui/message";
import { Panel, PanelHeader, PanelContent } from "@/components/ui/panel";
import { IconButton } from "@/components/ui/icon-button";
import { FilterButton } from "@/components/ui/filter-button";
import { SearchInput } from "@/components/ui/search-input";

interface LogsPanelProps {
  logs: LogMessage[];
  setLogs: React.Dispatch<React.SetStateAction<LogMessage[]>>;
  getMessageIcon: (type: string) => React.ReactNode;
  formatTimestamp: (timestamp?: number) => string;
  theme: "light" | "dark";
}

export function LogsPanel({
  logs,
  setLogs,
  getMessageIcon,
  formatTimestamp,
  theme,
}: LogsPanelProps) {
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedMessageId, setExpandedMessageId] = useState<number | null>(
    null
  );

  const handleExpand = (index: number) => {
    setExpandedMessageId(expandedMessageId === index ? null : index);
  };

  const groupedLogs = logs.reduce((acc, log) => {
    if (filter !== "all" && log.type !== filter) return acc;
    if (
      searchTerm &&
      !log.message.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return acc;

    const date = new Date(log.timestamp || Date.now());
    const key = date.toLocaleDateString();
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(log);
    return acc;
  }, {} as Record<string, LogMessage[]>);

  const stats = logs.reduce((acc, log) => {
    acc[log.type] = (acc[log.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleExport = () => {
    const exportData = logs.map((log) => ({
      type: log.type,
      message: log.message,
      timestamp: new Date(log.timestamp || Date.now()).toISOString(),
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-agent-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Panel theme={theme}>
      <PanelHeader theme={theme}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h2
              className={`text-xs font-medium transition-colors duration-300 ${
                theme === "dark" ? "text-white/70" : "text-black/70"
              }`}
            >
              Agent Logs
            </h2>
            <span
              className={`text-[10px] transition-colors duration-300 ${
                theme === "dark" ? "text-white/30" : "text-black/30"
              }`}
            >
              {logs.length} message{logs.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <IconButton
              theme={theme}
              onClick={handleExport}
              title="Export logs (JSON)"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </IconButton>
            <IconButton
              theme={theme}
              onClick={() => setLogs([])}
              title="Clear logs (⌘L)"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </IconButton>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <FilterButton
              theme={theme}
              isActive={filter === "all"}
              onClick={() => setFilter("all")}
              count={logs.length}
            >
              All
            </FilterButton>
            {Object.entries(stats).map(([type, count]) => (
              <FilterButton
                key={type}
                theme={theme}
                isActive={filter === type}
                onClick={() => setFilter(type)}
                count={count}
              >
                {type}
              </FilterButton>
            ))}
          </div>
          <SearchInput
            theme={theme}
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm("")}
          />
        </div>
      </PanelHeader>

      <PanelContent>
        <div className="divide-y divide-gray-50/5">
          {Object.entries(groupedLogs).map(([date, dateLogs]) => (
            <div key={date} className="relative">
              <div
                className={`sticky top-0 backdrop-blur-sm z-20 transition-colors duration-300 ${
                  theme === "dark" ? "bg-black/20" : "bg-white/20"
                }`}
              >
                <div className="px-4 py-1.5">
                  <span
                    className={`text-[10px] font-medium uppercase tracking-wider transition-colors duration-300 ${
                      theme === "dark" ? "text-white/30" : "text-black/30"
                    }`}
                  >
                    {date}
                  </span>
                </div>
              </div>

              <div className="relative">
                <div className="space-y-1 px-3 py-2">
                  {dateLogs.map((log, i) => {
                    const globalIndex = logs.findIndex((l) => l === log);
                    const isLastInGroup = i === dateLogs.length - 1;

                    return (
                      <div
                        key={i}
                        className="animate-slideIn"
                        style={{
                          animationDelay: `${i * 50}ms`,
                          opacity: 0,
                          animation: "slideIn 0.3s ease-out forwards",
                        }}
                      >
                        <Message
                          type={log.type}
                          content={log.message}
                          timestamp={log.timestamp?.getTime()}
                          index={globalIndex}
                          total={logs.length}
                          expanded={expandedMessageId === globalIndex}
                          onExpand={() => handleExpand(globalIndex)}
                          theme={theme}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
            <div className="w-16 h-16 mb-4 relative">
              <div
                className={`absolute inset-0 rounded-full animate-pulse transition-colors duration-300 ${
                  theme === "dark" ? "bg-white/5" : "bg-black/5"
                }`}
              />
              <svg
                className={`w-16 h-16 relative z-10 transition-colors duration-300 ${
                  theme === "dark" ? "text-white/10" : "text-black/10"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p
              className={`text-sm font-medium transition-colors duration-300 ${
                theme === "dark" ? "text-white/50" : "text-black/50"
              }`}
            >
              No messages yet
            </p>
            <p
              className={`text-xs mt-1 max-w-[200px] transition-colors duration-300 ${
                theme === "dark" ? "text-white/30" : "text-black/30"
              }`}
            >
              Start by sending a prompt to the agent to see the conversation
              here
            </p>
          </div>
        )}

        {logs.length > 0 && Object.keys(groupedLogs).length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
            <svg
              className={`w-12 h-12 mb-3 transition-colors duration-300 ${
                theme === "dark" ? "text-white/10" : "text-black/10"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p
              className={`text-sm font-medium transition-colors duration-300 ${
                theme === "dark" ? "text-white/50" : "text-black/50"
              }`}
            >
              No matching results
            </p>
            <p
              className={`text-xs mt-1 transition-colors duration-300 ${
                theme === "dark" ? "text-white/30" : "text-black/30"
              }`}
            >
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </PanelContent>
    </Panel>
  );
}
