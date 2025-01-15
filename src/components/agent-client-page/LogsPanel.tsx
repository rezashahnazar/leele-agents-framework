import React, { useState } from "react";
import { Message } from "@/app/types";
import { Message as MessageComponent } from "@/components/ui/message";
import { Panel, PanelHeader, PanelContent } from "@/components/ui/panel";
import { SearchInput } from "@/components/ui/search-input";
import { FilterButton } from "@/components/ui/filter-button";

interface LogsPanelProps {
  logs: Message[];
  setLogs: React.Dispatch<React.SetStateAction<Message[]>>;
}

export function LogsPanel({ logs, setLogs }: LogsPanelProps) {
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedMessageId, setExpandedMessageId] = useState<number | null>(
    null
  );

  const handleExpand = (index: number) => {
    setExpandedMessageId(expandedMessageId === index ? null : index);
  };

  const handleClear = () => {
    setSearchTerm("");
  };

  const groupedLogs = logs.reduce((acc, log) => {
    if (filter !== "all" && log.type !== filter) return acc;
    if (
      searchTerm &&
      !log.message.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return acc;

    const date = log.timestamp;
    const key = date.toLocaleDateString();
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(log);
    return acc;
  }, {} as Record<string, Message[]>);

  return (
    <Panel>
      <PanelHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-between w-full">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={handleClear}
              placeholder="Search logs..."
              className="min-w-[240px]"
            />
            <FilterButton
              options={[
                { label: "All Messages", value: "all" },
                { label: "Status Updates", value: "status" },
                { label: "Action Plans", value: "plan" },
                { label: "Results", value: "result" },
                { label: "Refinements", value: "refinement" },
                { label: "Errors", value: "error" },
              ]}
              value={filter}
              onChange={setFilter}
            />
          </div>
        </div>
      </PanelHeader>
      <PanelContent>
        {Object.entries(groupedLogs).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedLogs).map(([date, messages]) => (
              <div key={date}>
                <h3 className="sticky top-0 z-10 px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2 bg-background/80 backdrop-blur-sm">
                  <span className="h-px flex-1 bg-border/50" />
                  <span className="shrink-0">{date}</span>
                  <span className="h-px flex-1 bg-border/50" />
                </h3>
                <div className="space-y-2 px-2 pb-2">
                  {messages.map((message, index) => (
                    <MessageComponent
                      key={index}
                      type={message.type}
                      message={message.message}
                      timestamp={message.timestamp.getTime()}
                      index={index}
                      total={messages.length}
                      expanded={expandedMessageId === index}
                      onExpand={() => handleExpand(index)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {logs.length === 0 ? "No messages yet" : "No matching results"}
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              {logs.length === 0
                ? "Start by sending a prompt to the agent"
                : "Try adjusting your search or filters"}
            </p>
          </div>
        )}
      </PanelContent>
    </Panel>
  );
}
