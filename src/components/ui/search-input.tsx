import React from "react";

interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  placeholder?: string;
  theme: "light" | "dark";
}

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  theme,
}: SearchInputProps) {
  return (
    <div className="flex-1 relative">
      <div
        className={`absolute left-2 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
          theme === "dark" ? "text-white/30" : "text-black/30"
        }`}
      >
        <svg
          className="w-3 h-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full text-[10px] pl-7 pr-7 py-1 rounded-lg transition-all duration-300 ${
          theme === "dark"
            ? "bg-white/5 text-white/90 placeholder-white/30 focus:bg-white/10"
            : "bg-black/5 text-black/90 placeholder-black/30 focus:bg-black/10"
        } focus:outline-none focus:ring-1 ${
          theme === "dark" ? "focus:ring-white/20" : "focus:ring-black/20"
        } transform hover:scale-[1.01] focus:scale-[1.01]`}
      />
      {value && (
        <button
          onClick={onClear}
          className={`absolute right-2 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
            theme === "dark"
              ? "text-white/30 hover:text-white/50"
              : "text-black/30 hover:text-black/50"
          }`}
        >
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
