"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useTasks, useDeleteTask } from "@/hooks/useTasks";
import { StatusBadge } from "./StatusBadge";
import { StatusSelect } from "./StatusSelect";
import { TaskForm } from "./TaskForm";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { RoleGuard } from "@/components/common/RoleGuard";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import type { Task } from "@/lib/types";

export function TaskTable() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const limit = 10;
  const { data, isLoading, isError } = useTasks(page, limit, search);
  const deleteTask = useDeleteTask();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; taskId: number | null }>({
    open: false,
    taskId: null,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormModalOpen(true);
  };

  const handleDelete = (taskId: number) => {
    setDeleteConfirm({ open: true, taskId });
  };

  const confirmDelete = () => {
    if (deleteConfirm.taskId) {
      deleteTask.mutate(deleteConfirm.taskId);
      setDeleteConfirm({ open: false, taskId: null });
    }
  };

  const handleNewTask = () => {
    setEditingTask(undefined);
    setIsFormModalOpen(true);
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <>
      <div
        className="bg-white border rounded-lg overflow-hidden"
        style={{
          borderColor: "var(--color-border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <div className="flex items-center gap-2">
            <h2
              className="text-base font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Task List
            </h2>
            {data && (
              <span
                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: "var(--color-accent-light)",
                  color: "var(--color-accent)",
                }}
              >
                {data.pagination?.total || 0}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search tasks"
              className="w-56 h-9"
            />
            <RoleGuard allowedRoles={["ADMIN"]}>
              <button
                onClick={handleNewTask}
                className="flex items-center gap-2 h-9 px-4 text-sm font-semibold text-white rounded transition-colors"
                style={{
                  backgroundColor: "var(--color-accent)",
                  borderRadius: "var(--radius-md)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-accent-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-accent)";
                }}
              >
                <Plus className="w-4 h-4" />
                New Task
              </button>
            </RoleGuard>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: "var(--color-surface-2)" }}>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                <th className="w-10 px-5 py-3 text-left">
                  <input type="checkbox" className="w-4 h-4" />
                </th>
                <th
                  className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  #
                </th>
                <th
                  className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Title
                </th>
                <th
                  className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Description
                </th>
                <th
                  className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Status
                </th>
                <th
                  className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Assigned To
                </th>
                <th
                  className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Created By
                </th>
                <th
                  className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Created At
                </th>
                {isAdmin && (
                  <th
                    className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8}>
                    <TableSkeleton rows={5} columns={isAdmin ? 9 : 8} />
                  </td>
                </tr>
              ) : isError || !data?.tasks || data.tasks.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8}>
                    <EmptyState
                      message="No tasks found"
                      action={
                        isAdmin ? (
                          <button
                            onClick={handleNewTask}
                            className="text-sm font-medium"
                            style={{ color: "var(--color-accent)" }}
                          >
                            + Add your first task
                          </button>
                        ) : undefined
                      }
                    />
                  </td>
                </tr>
              ) : (
                data.tasks.map((task, index) => (
                  <tr
                    key={task.id}
                    className="border-b transition-colors hover:bg-[var(--color-surface-2)]"
                    style={{ borderColor: "var(--color-border-light)" }}
                  >
                    <td className="px-5 py-3.5">
                      <input type="checkbox" className="w-4 h-4" />
                    </td>
                    <td
                      className="px-5 py-3.5 text-sm"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td
                      className="px-5 py-3.5 text-sm font-medium"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {task.title}
                    </td>
                    <td
                      className="px-5 py-3.5 text-sm max-w-xs"
                      style={{ color: "var(--color-text-primary)" }}
                      title={task.description}
                    >
                      <div className="truncate">
                        {task.description.length > 50
                          ? `${task.description.substring(0, 50)}...`
                          : task.description}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {isAdmin ? (
                        <StatusBadge status={task.status} />
                      ) : (
                        <StatusSelect taskId={task.id} currentStatus={task.status} />
                      )}
                    </td>
                    <td
                      className="px-5 py-3.5 text-sm"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {task.assignedTo?.name || "—"}
                    </td>
                    <td
                      className="px-5 py-3.5 text-sm"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {task.createdBy.name}
                    </td>
                    <td
                      className="px-5 py-3.5 text-sm"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {formatDate(task.createdAt)}
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(task)}
                            className="w-8 h-8 flex items-center justify-center rounded transition-colors"
                            style={{
                              borderRadius: "var(--radius-sm)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "var(--color-accent-light)";
                              e.currentTarget.style.color = "var(--color-accent)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                              e.currentTarget.style.color = "";
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="w-8 h-8 flex items-center justify-center rounded transition-colors"
                            style={{
                              borderRadius: "var(--radius-sm)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "var(--color-danger-bg)";
                              e.currentTarget.style.color = "var(--color-danger)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                              e.currentTarget.style.color = "";
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data?.pagination && data.tasks.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={data.pagination.totalPages}
            totalResults={data.pagination.total}
            resultsPerPage={limit}
            onPageChange={setPage}
          />
        )}
      </div>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, taskId: null })}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={confirmDelete}
      />

      <Dialog
        open={isFormModalOpen}
        onOpenChange={(open) => {
          setIsFormModalOpen(open);
          if (!open) {
            setEditingTask(undefined);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "Create Task"}</DialogTitle>
          </DialogHeader>
          <TaskForm
            task={editingTask}
            onSuccess={() => {
              setIsFormModalOpen(false);
              setEditingTask(undefined);
            }}
            onCancel={() => {
              setIsFormModalOpen(false);
              setEditingTask(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
