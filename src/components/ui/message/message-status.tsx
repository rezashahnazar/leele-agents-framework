import React from "react";
import { Icon } from "../base/icon";

interface MessageStatusProps {
  type: "status" | "plan" | "result" | "refinement" | "error";
  isHovered: boolean;
  theme: "light" | "dark";
}

const statusConfigs = {
  status: {
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    color: "text-purple-500",
    bgColor: "bg-purple-500/5",
    ringColor: "ring-purple-500/10",
  },
  plan: {
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/5",
    ringColor: "ring-yellow-500/10",
  },
  result: {
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    color: "text-green-500",
    bgColor: "bg-green-500/5",
    ringColor: "ring-green-500/10",
  },
  refinement: {
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
        />
      </svg>
    ),
    color: "text-blue-500",
    bgColor: "bg-blue-500/5",
    ringColor: "ring-blue-500/10",
  },
  error: {
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    color: "text-red-500",
    bgColor: "bg-red-500/5",
    ringColor: "ring-red-500/10",
  },
} as const;

export function MessageStatus({ type, isHovered, theme }: MessageStatusProps) {
  const config = statusConfigs[type];

  return (
    <div
      className={`
        relative
        transition-transform duration-200
        ${isHovered ? "scale-105" : "scale-100"}
      `}
    >
      {/* Icon Container */}
      <div
        className={`
          relative
          p-1.5 rounded-md
          transition-all duration-200
          ${config.bgColor}
          ring-1 ${config.ringColor}
          ${theme === "dark" ? "bg-black/20" : "bg-white/20"}
          ${isHovered ? "ring-2" : "ring-1"}
        `}
      >
        <Icon
          size="sm"
          className={`${config.color} ${
            type === "status" ? "animate-spin" : ""
          }`}
        >
          {config.icon}
        </Icon>
      </div>
    </div>
  );
}
