import React from "react";

interface IconButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
  theme: "light" | "dark";
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
}

export function IconButton({
  children,
  onClick,
  title,
  theme,
  size = "md",
  variant = "ghost",
  disabled = false,
}: IconButtonProps) {
  const sizeStyles = {
    sm: "p-1",
    md: "p-1.5",
    lg: "p-2",
  };

  const variantStyles = {
    primary: {
      light: "bg-black/10 hover:bg-black/15 text-black/90",
      dark: "bg-white/10 hover:bg-white/15 text-white/90",
    },
    secondary: {
      light: "bg-white hover:bg-gray-50 text-black/70 border border-black/10",
      dark: "bg-black hover:bg-gray-900 text-white/70 border border-white/10",
    },
    ghost: {
      light: "text-black/50 hover:text-black/70 hover:bg-black/10",
      dark: "text-white/50 hover:text-white/70 hover:bg-white/10",
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${
        sizeStyles[size]
      } rounded-full transition-all duration-300 ${
        variantStyles[variant][theme]
      } ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "transform hover:scale-105 active:scale-95"
      }`}
    >
      {children}
    </button>
  );
}
