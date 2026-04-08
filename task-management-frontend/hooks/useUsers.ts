import { useQuery } from "@tanstack/react-query";
import { apiClient, unwrapResponse } from "@/lib/api";
import type { User, ApiResponse } from "@/lib/types";

export function useUsers(page: number = 1, limit: number = 100, search: string = "") {
  return useQuery({
    queryKey: ["users", page, limit, search],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) {
        queryParams.append("search", search);
      }

      const response = await apiClient.get<ApiResponse<User[]>>(`/users?${queryParams.toString()}`);
      const data = unwrapResponse(response);
      return {
        users: data.data,
        pagination: data.meta.pagination,
      };
    },
  });
}
