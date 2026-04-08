interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 6 }: TableSkeletonProps) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 px-5 py-3.5 border-b"
          style={{ borderColor: "var(--color-border-light)" }}
        >
          {Array.from({ length: columns }).map((_, j) => (
            <div
              key={j}
              className="h-4 rounded"
              style={{
                backgroundColor: "var(--color-border-light)",
                width: j === 0 ? "40px" : j === 1 ? "60%" : j === columns - 1 ? "80px" : "40%",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
