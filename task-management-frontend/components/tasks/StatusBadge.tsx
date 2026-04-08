import type { TaskStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: TaskStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    PENDING: {
      bg: "var(--color-warning-bg)",
      color: "var(--color-warning)",
      label: "Pending",
    },
    PROCESSING: {
      bg: "var(--color-info-bg)",
      color: "var(--color-info)",
      label: "Processing",
    },
    DONE: {
      bg: "var(--color-success-bg)",
      color: "var(--color-success)",
      label: "Done",
    },
  };

  const { bg, color, label } = config[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: bg, color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
