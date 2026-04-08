"use client";

import { useAuthStore } from "@/store/authStore";

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div
      className="bg-white border rounded-lg p-6"
      style={{
        borderColor: "var(--color-border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <h2
        className="text-base font-semibold"
        style={{ color: "var(--color-text-primary)" }}
      >
        Profile
      </h2>

      <div className="mt-5 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
            Name
          </p>
          <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
            {user?.name || "-"}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
            Email
          </p>
          <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
            {user?.email || "-"}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
            Role
          </p>
          <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
            {user?.role || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
