import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatNumber(num: number, decimals = 4): string {
  return num.toFixed(decimals);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "Siswa Terbaik":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800";
    case "Sangat Baik":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800";
    case "Baik":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800";
    case "Cukup Baik":
      return "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400 border border-sky-200 dark:border-sky-800";
    case "Cukup":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border border-gray-200 dark:border-gray-800";
  }
}

export function getGenderLabel(gender: "LAKI_LAKI" | "PEREMPUAN"): string {
  return gender === "LAKI_LAKI" ? "Laki-laki" : "Perempuan";
}

