import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate, getInitials } from "@/lib/utils";
import type { AuditLog } from "@/lib/types";

interface AuditDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: AuditLog | null;
}

function formatJSON(obj: unknown): string {
  if (!obj) return "null";
  let json = JSON.stringify(obj, null, 2);
  
  json = json.replace(/"([^"]+)":/g, '<span style="color: #98A2B3">"$1":</span>');
  json = json.replace(/: "([^"]*)"/g, ': <span style="color: #3ecf8e">"$1"</span>');
  json = json.replace(/: (\d+\.?\d*)/g, ': <span style="color: #5b6af0">$1</span>');
  json = json.replace(/: (true|false|null)/g, ': <span style="color: #F79009">$1</span>');
  
  return json;
}

export function AuditDetailModal({ open, onOpenChange, log }: AuditDetailModalProps) {
  if (!log) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Audit Log #{log.id} — {log.action.replace(/_/g, " ")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div
                className="text-xs uppercase font-medium mb-2"
                style={{ color: "var(--color-text-muted)" }}
              >
                Before
              </div>
              <pre
                className="p-4 rounded overflow-auto text-[13px] font-mono leading-relaxed"
                style={{
                  backgroundColor: "#fff",
                  color: "#222",
                  borderRadius: "var(--radius-md)",
                  maxHeight: "300px",
                  border: "1px solid #eee",
                }}
                dangerouslySetInnerHTML={{
                  __html: formatJSON(log.before),
                }}
              />
            </div>

            <div>
              <div
                className="text-xs uppercase font-medium mb-2"
                style={{ color: "var(--color-text-muted)" }}
              >
                After
              </div>
              <pre
                className="p-4 rounded overflow-auto text-[13px] font-mono leading-relaxed"
                style={{
                  backgroundColor: "#fff",
                  color: "#222",
                  borderRadius: "var(--radius-md)",
                  maxHeight: "300px",
                  border: "1px solid #eee",
                }}
                dangerouslySetInnerHTML={{
                  __html: formatJSON(log.after),
                }}
              />
            </div>
          </div>

          <div
            className="border-t pt-4 space-y-2"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-medium"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Summary:
              </span>
              <span
                className="text-sm"
                style={{ color: "var(--color-text-primary)" }}
              >
                {log.summary}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className="text-sm font-medium"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Actor:
              </span>
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
            </div>

            <div className="flex items-center gap-2">
              <span
                className="text-sm font-medium"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Timestamp:
              </span>
              <span
                className="text-sm"
                style={{ color: "var(--color-text-primary)" }}
              >
                {formatDate(log.createdAt, "MMM d, yyyy h:mm a")}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
