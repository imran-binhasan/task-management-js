"use client";

import { useEffect, useState } from "react";
import { useUsers } from "@/hooks/useUsers";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskForm } from "@/components/tasks/TaskForm";
import { formatDate, getInitials } from "@/lib/utils";
import type { User } from "@/lib/types";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [assignUser, setAssignUser] = useState<User | null>(null);
  const limit = 10;
  const { data, isLoading } = useUsers(page, limit, search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <div
      className="bg-white border rounded-lg overflow-hidden"
      style={{
        borderColor: "var(--color-border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <div className="flex items-center gap-2">
          <h2
            className="text-base font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            User List
          </h2>
          {data && (
            <span
              className="px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: "var(--color-accent-light)",
                color: "var(--color-accent)",
              }}
            >
              {data.pagination?.total || 0}
            </span>
          )}
        </div>

        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search users"
          className="w-56 h-9"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ backgroundColor: "var(--color-surface-2)" }}>
            <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
              <th className="w-10 px-5 py-3 text-left">
                <input type="checkbox" className="w-4 h-4" />
              </th>
              <th
                className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide"
                style={{ color: "var(--color-text-muted)" }}
              >
                #
              </th>
              <th
                className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide"
                style={{ color: "var(--color-text-muted)" }}
              >
                User
              </th>
              <th
                className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide"
                style={{ color: "var(--color-text-muted)" }}
              >
                Email
              </th>
              <th
                className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide"
                style={{ color: "var(--color-text-muted)" }}
              >
                Role
              </th>
              <th
                className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide"
                style={{ color: "var(--color-text-muted)" }}
              >
                Joined At
              </th>
              <th
                className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide"
                style={{ color: "var(--color-text-muted)" }}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7}>
                  <TableSkeleton rows={5} columns={7} />
                </td>
              </tr>
            ) : !data?.users || data.users.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState message="No users found" />
                </td>
              </tr>
            ) : (
              data.users.map((user, index) => (
                <tr
                  key={user.id}
                  className="border-b transition-colors hover:bg-[var(--color-surface-2)]"
                  style={{ borderColor: "var(--color-border-light)" }}
                >
                  <td className="px-5 py-3.5">
                    <input type="checkbox" className="w-4 h-4" />
                  </td>
                  <td
                    className="px-5 py-3.5 text-sm"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {(page - 1) * limit + index + 1}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                        style={
                          user.role === "ADMIN"
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
                        {getInitials(user.name)}
                      </div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td
                    className="px-5 py-3.5 text-sm"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {user.email}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium uppercase"
                      style={
                        user.role === "ADMIN"
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
                      {user.role}
                    </span>
                  </td>
                  <td
                    className="px-5 py-3.5 text-sm"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => setAssignUser(user)}
                      className="text-xs font-medium px-3 py-1 rounded transition-colors"
                      style={{
                        color: "var(--color-accent)",
                        borderRadius: "var(--radius-sm)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--color-accent-light)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      Assign Task
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data?.pagination && data.users.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={data.pagination.totalPages}
          totalResults={data.pagination.total}
          resultsPerPage={limit}
          onPageChange={setPage}
        />
      )}

      <Dialog open={!!assignUser} onOpenChange={(open) => !open && setAssignUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Assign Task to {assignUser?.name}
            </DialogTitle>
          </DialogHeader>
          <TaskForm
            initialAssignedToId={assignUser?.id ?? null}
            submitLabel="Create & Assign"
            onSuccess={() => setAssignUser(null)}
            onCancel={() => setAssignUser(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
