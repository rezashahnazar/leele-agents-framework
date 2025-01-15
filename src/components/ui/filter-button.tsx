"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterButtonProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterButton({
  options,
  value,
  onChange,
  className,
}: FilterButtonProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "h-8 px-2 text-xs bg-transparent border-muted hover:bg-accent w-fit",
          className
        )}
      >
        <div className="flex items-center gap-1.5">
          <Filter className="h-3 w-3 text-muted-foreground" />
          <SelectValue placeholder="Filter" className="text-muted-foreground" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="text-xs"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
