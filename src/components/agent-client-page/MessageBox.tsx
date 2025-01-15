import React from "react";
import { Message as MessageType } from "@/app/types";
import { Message } from "../ui/message";

interface MessageBoxProps {
  message: MessageType;
  index: number;
  totalMessages: number;
  isExpanded: boolean;
  onExpand: () => void;
}

export function MessageBox({
  message,
  index,
  totalMessages,
  isExpanded,
  onExpand,
}: MessageBoxProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(message.message);
  };

  return (
    <Message
      type={message.type}
      message={message.message}
      timestamp={message.timestamp.getTime()}
      index={index}
      total={totalMessages}
      expanded={isExpanded}
      onExpand={onExpand}
      onCopy={handleCopy}
    />
  );
}
