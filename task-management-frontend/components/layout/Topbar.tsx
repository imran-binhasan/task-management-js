"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/tasks": "Tasks",
  "/users": "Users",
  "/audit-logs": "Audit Logs",
  "/profile": "Profile",
};

export function Topbar() {
  const pathname = usePathname();
  const [now, setNow] = useState(new Date());
  const pageTitle = PAGE_TITLES[pathname] || "Dashboard";

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className="h-16 bg-[var(--color-surface)] border-b flex items-center px-6 flex-shrink-0"
      style={{
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex-1">
        <h1
          className="text-xl font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          {pageTitle}
        </h1>
        <div
          className="flex items-center gap-1 text-xs mt-0.5"
          style={{ color: "var(--color-text-muted)" }}
        >
          <span>Home</span>
          <ChevronRight className="w-3 h-3" />
          <span>{pageTitle}</span>
        </div>
      </div>

      <div className="text-right">
        <div
          className="text-sm font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          {now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>
        <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          Current Time
        </div>
      </div>
    </header>
  );
}
