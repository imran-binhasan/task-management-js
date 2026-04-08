import { useQuery } from "@tanstack/react-query";
import { apiClient, unwrapResponse } from "@/lib/api";
import type { AuditLog, AuditLogFilters, ApiResponse } from "@/lib/types";

export function useAuditLogs(
  filters: AuditLogFilters = {},
  page: number = 1,
  limit: number = 10
) {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());
  
  if (filters.taskId) queryParams.append("taskId", filters.taskId.toString());
  if (filters.actorId) queryParams.append("actorId", filters.actorId.toString());
  if (filters.action) queryParams.append("action", filters.action);

  return useQuery({
    queryKey: ["audit-logs", filters, page, limit],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<AuditLog[]>>(
        `/audit-logs?${queryParams.toString()}`
      );
      const data = unwrapResponse(response);
      return {
        logs: data.data,
        pagination: data.meta.pagination,
      };
    },
  });
}
