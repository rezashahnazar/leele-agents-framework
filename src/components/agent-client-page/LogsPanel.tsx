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

  const handleClearLogs = () => {
    setLogs([]);
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
    <Panel className="h-full flex flex-col">
      <PanelHeader className="shrink-0 bg-background/60 backdrop-blur-md">
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex items-center gap-2">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={handleClear}
              placeholder="Search messages..."
              className="w-[200px]"
            />
            <FilterButton
              options={[
                { label: "All", value: "all" },
                { label: "Status", value: "status" },
                { label: "Plan", value: "plan" },
                { label: "Result", value: "result" },
                { label: "Refine", value: "refinement" },
                { label: "Error", value: "error" },
              ]}
              value={filter}
              onChange={setFilter}
            />
          </div>
          <button
            onClick={handleClearLogs}
            className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            Clear
          </button>
        </div>
      </PanelHeader>
      <PanelContent className="flex-1 overflow-y-auto bg-transparent">
        {Object.entries(groupedLogs).length > 0 ? (
          <div className="space-y-4 pb-2">
            {Object.entries(groupedLogs).map(([date, messages]) => (
              <div key={date}>
                <h3 className="sticky top-0 z-10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 flex items-center gap-2 bg-background/80 backdrop-blur-lg">
                  <span className="h-px flex-1 bg-border/20" />
                  <span className="shrink-0">{date}</span>
                  <span className="h-px flex-1 bg-border/20" />
                </h3>
                <div className="space-y-2 px-2">
                  {messages.map((message, index) => (
                    <MessageComponent
                      key={index}
                      type={message.type}
                      message={message.message}
                      timestamp={message.timestamp.getTime()}
                      expanded={expandedMessageId === index}
                      onExpand={() => handleExpand(index)}
                      index={index}
                      total={messages.length}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p className="text-sm">No messages yet</p>
          </div>
        )}
      </PanelContent>
    </Panel>
  );
}
