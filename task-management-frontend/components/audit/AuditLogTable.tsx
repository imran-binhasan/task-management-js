"use client";

import { useState } from "react";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { AuditDetailModal } from "./AuditDetailModal";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { formatDate, getInitials } from "@/lib/utils";
import type { AuditLog, AuditAction } from "@/lib/types";

export function AuditLogTable() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading } = useAuditLogs({}, page, limit);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const getActionBadge = (action: AuditAction) => {
    const config = {
      TASK_CREATED: { bg: "var(--color-success-bg)", color: "var(--color-success)" },
      TASK_UPDATED: { bg: "var(--color-info-bg)", color: "var(--color-info)" },
      TASK_DELETED: { bg: "var(--color-danger-bg)", color: "var(--color-danger)" },
      STATUS_CHANGED: { bg: "var(--color-warning-bg)", color: "var(--color-warning)" },
      TASK_ASSIGNED: { bg: "var(--color-accent-light)", color: "var(--color-accent)" },
    };

    const { bg, color } = config[action];

    return (
      <span
        className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ backgroundColor: bg, color }}
      >
        {action.replace(/_/g, " ")}
      </span>
    );
  };

  return (
    <>
      <div
        className="bg-white border rounded-lg overflow-hidden"
        style={{
          borderColor: "var(--color-border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <div className="flex items-center gap-2">
            <h2
              className="text-base font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Audit Log
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
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: "var(--color-surface-2)" }}>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
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
                  Timestamp
                </th>
                <th
                  className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Actor
                </th>
                <th
                  className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Action
                </th>
                <th
                  className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Task ID
                </th>
                <th
                  className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Summary
                </th>
                <th
                  className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Details
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
              ) : !data?.logs || data.logs.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState message="No audit logs found" />
                  </td>
                </tr>
              ) : (
                data.logs.map((log, index) => (
                  <tr
                    key={log.id}
                    className="border-b transition-colors hover:bg-[var(--color-surface-2)]"
                    style={{ borderColor: "var(--color-border-light)" }}
                  >
                    <td
                      className="px-5 py-3.5 text-sm"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td
                      className="px-5 py-3.5 text-sm"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {formatDate(log.createdAt, "MMM d, yyyy h:mm a")}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                          style={{
                            backgroundColor: "var(--color-accent-light)",
                            color: "var(--color-accent)",
                          }}
                        >
                          {getInitials(log.actor.name)}
                        </div>
                        <span
                          className="text-sm"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {log.actor.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">{getActionBadge(log.action)}</td>
                    <td
                      className="px-5 py-3.5 text-sm font-mono"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {log.taskId}
                    </td>
                    <td
                      className="px-5 py-3.5 text-sm max-w-xs truncate"
                      style={{ color: "var(--color-text-primary)" }}
                      title={log.summary}
                    >
                      {log.summary}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setSelectedLog(log)}
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
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data?.pagination && data.logs.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={data.pagination.totalPages}
            totalResults={data.pagination.total}
            resultsPerPage={limit}
            onPageChange={setPage}
          />
        )}
      </div>

      <AuditDetailModal
        open={!!selectedLog}
        onOpenChange={(open) => !open && setSelectedLog(null)}
        log={selectedLog}
      />
    </>
  );
}
