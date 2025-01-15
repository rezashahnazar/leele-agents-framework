import React from "react";

interface FilterButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  theme: "light" | "dark";
  count?: number;
}

export function FilterButton({
  children,
  onClick,
  isActive = false,
  theme,
  count,
}: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all duration-300 ${
        isActive
          ? theme === "dark"
            ? "bg-white/10 text-white"
            : "bg-black/10 text-black"
          : theme === "dark"
          ? "text-white/50 hover:text-white/70 hover:bg-white/5"
          : "text-black/50 hover:text-black/70 hover:bg-black/5"
      } transform hover:scale-[1.02] active:scale-[0.98]`}
    >
      <span className="flex items-center gap-1">
        {children}
        {count !== undefined && (
          <span
            className={`transition-colors duration-300 ${
              isActive
                ? theme === "dark"
                  ? "text-white/50"
                  : "text-black/50"
                : theme === "dark"
                ? "text-white/30"
                : "text-black/30"
            }`}
          >
            ({count})
          </span>
        )}
      </span>
    </button>
  );
}
