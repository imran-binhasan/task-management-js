"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, Eye, EyeOff, UserCircle, ShieldCheck, AlertCircle, Zap } from "lucide-react";
import { isAxiosError } from "axios";
import { apiClient, unwrapData } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { LoginResponse, ApiResponse } from "@/lib/types";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isUsingUserCreds, setIsUsingUserCreds] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@example.com",
      password: "admin123",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>("/auth/login", data);
      const { accessToken, user } = unwrapData(response);

      setAuth(user, accessToken);

      toast.success("Login successful");
      router.replace("/tasks");
    } catch (error: unknown) {
      const message =
        isAxiosError<ApiResponse<null>>(error)
          ? (error.response?.data?.message ?? "Login failed. Please try again.")
          : "Login failed. Please try again.";
      setApiError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCredentials = () => {
    if (isUsingUserCreds) {
      setValue("email", "admin@example.com");
      setValue("password", "admin123");
      setIsUsingUserCreds(false);
    } else {
      setValue("email", "user@example.com");
      setValue("password", "user123");
      setIsUsingUserCreds(true);
    }
  };

  return (
    <div className="flex h-screen">
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 text-white"
        style={{ backgroundColor: "var(--color-accent)" }}
      >
        <div className="max-w-md w-full">
          <svg
            className="w-full h-64 mb-12"
            viewBox="0 0 400 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="80" cy="80" r="60" fill="white" fillOpacity="0.1" />
            <rect x="200" y="40" width="120" height="120" rx="12" fill="white" fillOpacity="0.15" />
            <circle cx="320" cy="200" r="40" fill="white" fillOpacity="0.12" />
            <line x1="100" y1="200" x2="250" y2="200" stroke="white" strokeOpacity="0.2" strokeWidth="4" />
            <line x1="50" y1="230" x2="200" y2="230" stroke="white" strokeOpacity="0.15" strokeWidth="3" />
            <rect x="40" y="160" width="80" height="20" rx="4" fill="white" fillOpacity="0.18" />
          </svg>

          <h2 className="text-[28px] font-bold text-center mb-3">
            Manage Tasks Efficiently
          </h2>
          <p className="text-center text-white/80 text-base max-w-xs mx-auto">
            Role-based access, real-time updates, and full audit trails.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white relative">
        <div className="absolute top-6 right-6 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Don&apos;t have an account?
        </div>

        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-9 h-9 flex items-center justify-center text-white font-bold text-xl"
                style={{
                  backgroundColor: "var(--color-accent)",
                  borderRadius: "var(--radius-lg)",
                }}
              >
                <Zap className="w-5 h-5" />
              </div>
              <span
                className="text-[22px] font-bold"
                style={{ color: "var(--color-text-primary)" }}
              >
                TaskFlow
              </span>
            </div>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--color-text-primary)" }}
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "var(--color-text-muted)" }}
                />
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="admin@example.com"
                  className="w-full h-11 pl-10 pr-3.5 border text-sm outline-none transition-all"
                  style={{
                    borderRadius: "var(--radius-md)",
                    borderColor: errors.email ? "var(--color-danger)" : "var(--color-border)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--color-accent)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(90, 79, 207, 0.12)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.email ? "var(--color-danger)" : "var(--color-border)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
              {errors.email && (
                <p className="text-xs mt-1" style={{ color: "var(--color-danger)" }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--color-text-primary)" }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "var(--color-text-muted)" }}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-10 border text-sm outline-none transition-all"
                  style={{
                    borderRadius: "var(--radius-md)",
                    borderColor: errors.password ? "var(--color-danger)" : "var(--color-border)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--color-accent)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(90, 79, 207, 0.12)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.password ? "var(--color-danger)" : "var(--color-border)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs mt-1" style={{ color: "var(--color-danger)" }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {apiError && (
              <div
                className="flex items-center gap-2 p-3 text-sm rounded"
                style={{
                  backgroundColor: "var(--color-danger-bg)",
                  color: "var(--color-danger)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <div className="space-y-3 pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-white text-sm font-semibold rounded transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: "var(--color-accent)",
                  borderRadius: "var(--radius-md)",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) e.currentTarget.style.backgroundColor = "var(--color-accent-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-accent)";
                }}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>

              <button
                type="button"
                onClick={toggleCredentials}
                className="w-full h-11 text-sm font-semibold rounded transition-colors flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "var(--color-accent-light)",
                  color: "var(--color-accent)",
                  borderRadius: "var(--radius-md)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#E4E0FF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-accent-light)";
                }}
              >
                {isUsingUserCreds ? (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Use Admin Credentials
                  </>
                ) : (
                  <>
                    <UserCircle className="w-4 h-4" />
                    Use User Credentials
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div
          className="absolute bottom-6 text-xs text-center"
          style={{ color: "var(--color-text-muted)" }}
        >
          © 2026 TaskFlow. All rights reserved.
        </div>
      </div>
    </div>
  );
}
