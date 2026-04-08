import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { apiClient, unwrapResponse } from "@/lib/api";
import type { Task, CreateTaskRequest, UpdateTaskRequest, ApiResponse } from "@/lib/types";
import { toast } from "sonner";

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<ApiResponse<null>>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
}

export function useTasks(page: number = 1, limit: number = 10, search: string = "") {
  return useQuery({
    queryKey: ["tasks", page, limit, search],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) {
        queryParams.append("search", search);
      }

      const response = await apiClient.get<ApiResponse<Task[]>>(`/tasks?${queryParams.toString()}`);
      const data = unwrapResponse(response);
      return {
        tasks: data.data,
        pagination: data.meta.pagination,
      };
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTaskRequest) => {
      const response = await apiClient.post<ApiResponse<Task>>("/tasks", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully");
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, "Failed to create task");
      toast.error(message);
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateTaskRequest }) => {
      const response = await apiClient.patch<ApiResponse<Task>>(`/tasks/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task updated successfully");
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, "Failed to update task");
      toast.error(message);
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted successfully");
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, "Failed to delete task");
      toast.error(message);
    },
  });
}
