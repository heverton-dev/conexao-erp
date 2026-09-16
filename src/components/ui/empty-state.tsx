import { cn } from "~/lib/utils";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className,
      )}
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-surface mb-4">
        {icon || <Inbox className="w-8 h-8 text-text-muted" />}
      </div>
      <h3 className="text-lg font-semibold text-text-main mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-text-muted max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
