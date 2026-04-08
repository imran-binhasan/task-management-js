"use client";

import { useEffect } from "react";
import { isAxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/api";
import type { ApiResponse, User } from "@/lib/types";

export function useAuthInit() {
  const { accessToken, clearAuth, setAuth, setInitialized, isInitialized } = useAuthStore();

  useEffect(() => {
    async function validateToken() {
      if (!accessToken) {
        setInitialized(true);
        return;
      }

      try {
        const response = await apiClient.get<ApiResponse<User>>("/auth/me");
        const user = response.data.data;
        setAuth(user, accessToken);
        setInitialized(true);
      } catch (error: unknown) {
        if (isAxiosError<ApiResponse<null>>(error) && error.response?.status === 401) {
          clearAuth();
        }
        setInitialized(true);
      }
    }

    if (!isInitialized) {
      validateToken();
    }
  }, [accessToken, clearAuth, setAuth, setInitialized, isInitialized]);

  return { isInitialized };
}
