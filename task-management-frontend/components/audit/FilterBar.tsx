"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AuditAction, AuditLogFilters } from "@/lib/types";

interface FilterBarProps {
  onApplyFilters: (filters: AuditLogFilters) => void;
}

export function FilterBar({ onApplyFilters }: FilterBarProps) {
  const [action, setAction] = useState<AuditAction | "ALL">("ALL");
  const [taskId, setTaskId] = useState("");
  const [actorId, setActorId] = useState("");

  const handleApply = () => {
    const filters: AuditLogFilters = {};
    if (action !== "ALL") filters.action = action;
    if (taskId) filters.taskId = Number(taskId);
    if (actorId) filters.actorId = Number(actorId);
    onApplyFilters(filters);
  };

  const handleReset = () => {
    setAction("ALL");
    setTaskId("");
    setActorId("");
    onApplyFilters({});
  };

  return (
    <div
      className="bg-white border rounded-lg px-5 py-4 mb-4"
      style={{
        borderColor: "var(--color-border)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      <div className="flex items-end gap-3 flex-wrap">
        <div className="flex-1 min-w-[180px]">
          <Label htmlFor="action" className="mb-1.5 block text-sm font-medium">
            Action
          </Label>
          <Select value={action} onValueChange={(val) => setAction(val as AuditAction | "ALL")}>
            <SelectTrigger id="action">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="TASK_CREATED">Task Created</SelectItem>
              <SelectItem value="TASK_UPDATED">Task Updated</SelectItem>
              <SelectItem value="TASK_DELETED">Task Deleted</SelectItem>
              <SelectItem value="STATUS_CHANGED">Status Changed</SelectItem>
              <SelectItem value="TASK_ASSIGNED">Task Assigned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-40">
          <Label htmlFor="taskId" className="mb-1.5 block text-sm font-medium">
            Task ID
          </Label>
          <Input
            id="taskId"
            type="number"
            placeholder="Filter by task ID"
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
          />
        </div>

        <div className="w-40">
          <Label htmlFor="actorId" className="mb-1.5 block text-sm font-medium">
            Actor ID
          </Label>
          <Input
            id="actorId"
            type="number"
            placeholder="Filter by actor ID"
            value={actorId}
            onChange={(e) => setActorId(e.target.value)}
          />
        </div>

        <Button
          onClick={handleApply}
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          Apply Filters
        </Button>

        <Button variant="ghost" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </div>
  );
}
