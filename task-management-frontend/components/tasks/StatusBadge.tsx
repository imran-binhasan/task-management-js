import type { TaskStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: TaskStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    PENDING: {
      bg: "#FFF7E0", // solid light yellow
      color: "#B26A00", // dark yellow text
      label: "Pending",
    },
    PROCESSING: {
      bg: "#E6F0FF", // solid light blue
      color: "#1A5FB4", // dark blue text
      label: "Processing",
    },
    DONE: {
      bg: "#E6F9F0", // solid light green
      color: "#1A7F5A", // dark green text
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
