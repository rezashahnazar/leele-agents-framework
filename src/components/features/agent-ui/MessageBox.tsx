import React from "react";
import { Message as MessageType } from "@/app/types";
import { Message } from "@/components/ui/message";

interface MessageBoxProps {
  message: MessageType;
  index: number;
  totalMessages: number;
  isExpanded: boolean;
  onExpand: () => void;
  isStreaming?: boolean;
}

export function MessageBox({
  message,
  index,
  totalMessages,
  isExpanded,
  onExpand,
  isStreaming,
}: MessageBoxProps) {
  return (
    <Message
      type={message.type}
      message={message.message}
      timestamp={message.timestamp.getTime()}
      index={index}
      total={totalMessages}
      expanded={isExpanded}
      onExpand={onExpand}
      isStreaming={isStreaming}
    />
  );
}
