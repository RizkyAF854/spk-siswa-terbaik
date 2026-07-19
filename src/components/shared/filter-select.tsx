"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: string[];
  allLabel?: string;
}

export function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
  allLabel = "Semua",
}: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={(val) => { if (val !== null) onChange(val); }}>
      <SelectTrigger className="w-[180px] text-sm">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
