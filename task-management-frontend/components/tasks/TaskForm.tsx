"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import { useUsers } from "@/hooks/useUsers";
import type { Task, TaskStatus } from "@/lib/types";

const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  status: z.enum(["PENDING", "PROCESSING", "DONE"]).optional(),
  assignedToId: z.number().nullable().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: Task;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialAssignedToId?: number | null;
  submitLabel?: string;
}

export function TaskForm({
  task,
  onSuccess,
  onCancel,
  initialAssignedToId,
  submitLabel,
}: TaskFormProps) {
  const isEdit = !!task;
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const { data: usersData, isLoading: usersLoading } = useUsers();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "PENDING",
      assignedToId: null,
    },
  });

  const selectedStatus = useWatch({ control, name: "status" });
  const selectedAssignedToId = useWatch({ control, name: "assignedToId" });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        status: task.status,
        assignedToId: task.assignedToId,
      });
      return;
    }

    reset({
      title: "",
      description: "",
      status: "PENDING",
      assignedToId: initialAssignedToId ?? null,
    });
  }, [task, reset, initialAssignedToId]);

  const onSubmit = async (data: TaskFormData) => {
    if (isEdit && task) {
      await updateTask.mutateAsync({
        id: task.id,
        data: {
          title: data.title,
          description: data.description,
          status: data.status,
          assignedToId: data.assignedToId,
        },
      });
      onSuccess?.();
      return;
    }

    await createTask.mutateAsync({
      title: data.title,
      description: data.description,
      assignedToId: data.assignedToId,
    });
    reset({
      title: "",
      description: "",
      status: "PENDING",
      assignedToId: initialAssignedToId ?? null,
    });
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            {...register("title")}
            placeholder="Enter task title"
            className="mt-1.5"
          />
          {errors.title && (
            <p className="text-xs mt-1 text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="assignedTo">Assign To</Label>
          <Select
            value={selectedAssignedToId?.toString() || "unassigned"}
            onValueChange={(value) =>
              setValue("assignedToId", value === "unassigned" ? null : Number(value))
            }
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent>
              {usersLoading ? (
                <SelectItem value="loading" disabled>
                  Loading users...
                </SelectItem>
              ) : (
                <>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {usersData?.users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Enter task description"
          rows={4}
          className="mt-1.5"
        />
        {errors.description && (
          <p className="text-xs mt-1 text-red-600">{errors.description.message}</p>
        )}
      </div>

      {isEdit && (
        <div className="max-w-[260px]">
          <Label htmlFor="status">Status</Label>
          <Select
            value={selectedStatus}
            onValueChange={(value) => setValue("status", value as TaskStatus)}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="DONE">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          type="submit"
          disabled={createTask.isPending || updateTask.isPending}
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          {submitLabel || (isEdit ? "Save Changes" : "Create Task")}
        </Button>
        {isEdit && onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel Edit
          </Button>
        )}
      </div>
    </form>
  );
}
