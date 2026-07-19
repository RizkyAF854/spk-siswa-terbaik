"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = "Cari..." }: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, 300);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  return (
    <div className="relative w-full max-w-[300px]">
      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
      <Input
        type="search"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="pl-8 text-sm"
      />
    </div>
  );
}
