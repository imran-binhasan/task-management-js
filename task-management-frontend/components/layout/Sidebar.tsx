"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CheckSquare, Users, ClipboardList, LogOut, CircleUserRound, Zap } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { getInitials } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const navItems = [
    { name: "Tasks", path: "/tasks", icon: CheckSquare, roles: ["ADMIN", "USER"] },
    { name: "Users", path: "/users", icon: Users, roles: ["ADMIN"] },
    { name: "Audit Logs", path: "/audit-logs", icon: ClipboardList, roles: ["ADMIN"] },
    { name: "Profile", path: "/profile", icon: CircleUserRound, roles: ["ADMIN", "USER"] },
  ];

  const visibleNavItems = navItems.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false
  );

  return (
    <aside
      className="w-60 h-full bg-[var(--color-surface)] border-r flex flex-col flex-shrink-0"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
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
      </div>

      <div
        className="h-px mx-5"
        style={{ backgroundColor: "var(--color-border-light)" }}
      />

      <nav className="px-3 pt-4 flex-1">
        <div
          className="px-2 mb-2 text-[11px] font-medium uppercase tracking-wider"
          style={{ color: "var(--color-text-muted)", letterSpacing: "0.08em" }}
        >
          MAIN MENU
        </div>
        <ul className="space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-2.5 h-10 px-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-[var(--color-accent)] bg-[var(--color-accent-light)] border-l-[3px] -ml-[3px]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]"
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: "var(--color-accent-light)",
                          color: "var(--color-accent)",
                          borderLeftColor: "var(--color-accent)",
                        }
                      : {}
                  }
                >
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-5 pb-6">
        <div
          className="h-px mb-4"
          style={{ backgroundColor: "var(--color-border-light)" }}
        />
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
            style={{
              backgroundColor: "var(--color-accent-light)",
              color: "var(--color-accent)",
            }}
          >
            {user ? getInitials(user.name) : ""}
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-sm font-semibold truncate"
              style={{ color: "var(--color-text-primary)" }}
            >
              {user?.name}
            </div>
            <div
              className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full inline-block mt-0.5"
              style={
                user?.role === "ADMIN"
                  ? {
                      backgroundColor: "var(--color-accent-light)",
                      color: "var(--color-accent)",
                    }
                  : {
                      backgroundColor: "var(--color-surface-2)",
                      color: "var(--color-text-secondary)",
                    }
              }
            >
              {user?.role}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-8 h-8 flex items-center justify-center rounded hover:text-[var(--color-danger)] transition-colors"
            style={{ color: "var(--color-text-muted)" }}
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
