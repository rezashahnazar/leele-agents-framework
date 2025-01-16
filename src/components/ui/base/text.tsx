import React from "react";

export type TextSize = "xs" | "sm" | "base" | "lg" | "xl" | "2xl";
type TextWeight = "normal" | "medium" | "semibold" | "bold";
type TextAlign = "left" | "center" | "right";
type TextVariant = "primary" | "secondary" | "ghost";

interface TextProps {
  children: React.ReactNode;
  size?: TextSize;
  weight?: TextWeight;
  align?: TextAlign;
  variant?: TextVariant;
  className?: string;
  monospace?: boolean;
  truncate?: boolean;
}

export function Text({
  children,
  size = "base",
  weight = "normal",
  align = "left",
  variant = "primary",
  className = "",
  monospace = false,
  truncate = false,
}: TextProps) {
  const sizeStyles = {
    xs: "text-[10px] leading-[14px]",
    sm: "text-xs leading-4",
    base: "text-sm leading-5",
    lg: "text-base leading-6",
    xl: "text-lg leading-7",
    "2xl": "text-xl leading-8",
  };

  const weightStyles = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  };

  const alignStyles = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const variantStyles = {
    primary: "text-black dark:text-white",
    secondary: "text-black/70 dark:text-white/70",
    ghost: "text-black/50 dark:text-white/50",
  };

  return (
    <span
      className={`
        ${sizeStyles[size]}
        ${weightStyles[weight]}
        ${alignStyles[align]}
        ${variantStyles[variant]}
        ${monospace ? "font-mono" : "font-sans"}
        ${truncate ? "truncate" : ""}
        transition-colors duration-300
        ${className}
      `}
    >
      {children}
    </span>
  );
}
