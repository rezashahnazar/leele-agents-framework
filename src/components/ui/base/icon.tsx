import React from "react";
import { useTheme } from "@/lib/theme-context";

export type IconSize = "xs" | "sm" | "base" | "lg";
type IconVariant = "primary" | "secondary" | "ghost";

interface IconProps extends React.ComponentProps<"svg"> {
  children: React.ReactNode;
  size?: IconSize;
  variant?: IconVariant;
  className?: string;
  strokeWidth?: number;
}

export function Icon({
  children,
  size = "base",
  variant = "primary",
  className = "",
  strokeWidth = 1.5,
}: IconProps) {
  const { colors } = useTheme();

  const sizeStyles = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    base: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const variantStyles = {
    primary: `text-${colors.text}`,
    secondary: `text-${colors.text}/70`,
    ghost: `text-${colors.text}/50`,
  };

  return (
    <div
      className={`
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        transition-colors duration-300
        ${className}
      `}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(
            child as React.ReactElement<React.SVGProps<SVGSVGElement>>,
            {
              strokeWidth,
              className: "w-full h-full",
            }
          );
        }
        return child;
      })}
    </div>
  );
}
