import React from "react";
import { Surface } from "./base/surface";
import { Text } from "./base/text";
import { Icon } from "./base/icon";
import type { TextSize } from "./base/text";
import type { IconSize } from "./base/icon";

type ButtonSize = "sm" | "base" | "lg";
type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  size?: ButtonSize;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  title?: string;
}

export function Button({
  children,
  onClick,
  size = "base",
  variant = "primary",
  icon,
  iconPosition = "left",
  disabled = false,
  loading = false,
  className = "",
}: ButtonProps) {
  const sizeStyles = {
    sm: "px-2 py-1 gap-1.5",
    base: "px-3 py-1.5 gap-2",
    lg: "px-4 py-2 gap-2.5",
  };

  const getTextSize = (size: ButtonSize): TextSize => {
    switch (size) {
      case "sm":
        return "xs";
      case "base":
        return "sm";
      case "lg":
        return "base";
    }
  };

  const getIconSize = (size: ButtonSize): IconSize => {
    switch (size) {
      case "sm":
        return "xs";
      case "base":
        return "sm";
      case "lg":
        return "base";
    }
  };

  const getElevation = (variant: ButtonVariant): "none" | "low" | "medium" => {
    switch (variant) {
      case "primary":
        return "medium";
      case "secondary":
        return "low";
      case "ghost":
        return "none";
    }
  };

  const renderIcon = () => {
    if (!icon) return null;
    return (
      <Icon size={getIconSize(size)} variant={variant}>
        {icon}
      </Icon>
    );
  };

  const renderContent = () => (
    <>
      {iconPosition === "left" && renderIcon()}
      <Text size={getTextSize(size)} weight="medium">
        {children}
      </Text>
      {iconPosition === "right" && renderIcon()}
      {loading && (
        <Icon
          size={getIconSize(size)}
          variant={variant}
          className="animate-spin"
        >
          <svg fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </Icon>
      )}
    </>
  );

  return (
    <Surface
      elevation={getElevation(variant)}
      blur="sm"
      interactive={!disabled && !loading}
      onClick={!disabled && !loading ? onClick : undefined}
      className={`
        inline-flex items-center justify-center
        ${sizeStyles[size]}
        ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {renderContent()}
    </Surface>
  );
}
