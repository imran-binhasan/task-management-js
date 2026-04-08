"use client";

import { useUpdateTask } from "@/hooks/useTasks";
import type { TaskStatus } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatusSelectProps {
  taskId: number;
  currentStatus: TaskStatus;
}

export function StatusSelect({ taskId, currentStatus }: StatusSelectProps) {
  const updateTask = useUpdateTask();

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateTask.mutate({ id: taskId, data: { status: newStatus } });
  };

  const statusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "PROCESSING", label: "Processing" },
    { value: "DONE", label: "Done" },
  ];

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[120px] h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
