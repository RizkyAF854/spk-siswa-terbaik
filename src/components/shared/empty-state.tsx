import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900">
        <Inbox className="h-6 w-6 text-zinc-500" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-6" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
