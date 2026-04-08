import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  message?: string;
  action?: ReactNode;
}

export function EmptyState({ message = "No records found", action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Inbox
        className="w-10 h-10 mb-4"
        style={{ color: "var(--color-text-muted)" }}
      />
      <p
        className="text-sm mb-4"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {message}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
