"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  totalItems: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  totalItems,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
      <div className="text-sm text-zinc-500 dark:text-zinc-400">
        Menampilkan <span className="font-medium text-zinc-950 dark:text-zinc-50">{startItem}</span> sampai{" "}
        <span className="font-medium text-zinc-950 dark:text-zinc-50">{endItem}</span> dari{" "}
        <span className="font-medium text-zinc-950 dark:text-zinc-50">{totalItems}</span> data
      </div>
      <div className="flex items-center space-x-1 sm:space-x-2">
        <Button
          variant="outline"
          size="icon-xs"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-xs"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center justify-center text-sm font-medium px-2">
          Halaman {currentPage} dari {totalPages}
        </div>
        <Button
          variant="outline"
          size="icon-xs"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-xs"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
