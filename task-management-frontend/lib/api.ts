import axios, { type AxiosError, type AxiosResponse } from "axios";
import type { ApiResponse } from "@/lib/types";
import { useAuthStore } from "@/store/authStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<null>>) => {
    // Only auto-logout and redirect on 401 if user is already logged in (not during login attempt)
    const isLoginRequest = error.config?.url?.includes("/auth/login");
    if (error.response?.status === 401 && !isLoginRequest) {
      useAuthStore.getState().clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export function unwrapData<T>(response: AxiosResponse<ApiResponse<T>>): T {
  return response.data.data;
}

export function unwrapResponse<T>(response: AxiosResponse<ApiResponse<T>>): ApiResponse<T> {
  return response.data;
}
