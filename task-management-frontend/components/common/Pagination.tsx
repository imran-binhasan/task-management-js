import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  resultsPerPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalResults,
  resultsPerPage,
  onPageChange,
}: PaginationProps) {
  const startResult = (currentPage - 1) * resultsPerPage + 1;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 3;

    if (totalPages <= showPages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        for (let i = 1; i <= showPages; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 1) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - showPages + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div
      className="flex items-center justify-between px-5 py-3.5 border-t"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
        Showing {startResult} to {endResult} of {totalResults} results
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 h-9 px-3.5 text-sm font-medium border rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-text-secondary)",
            borderRadius: "var(--radius-md)",
          }}
          onMouseEnter={(e) => {
            if (currentPage !== 1) {
              e.currentTarget.style.backgroundColor = "var(--color-surface-2)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex gap-2">
          {getPageNumbers().map((page, index) =>
            page === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="flex items-center justify-center w-9 h-9 text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => typeof page === "number" && onPageChange(page)}
                className={`w-9 h-9 text-sm font-medium border rounded transition-colors ${
                  currentPage === page ? "text-white" : ""
                }`}
                style={
                  currentPage === page
                    ? {
                        backgroundColor: "var(--color-accent)",
                        borderColor: "var(--color-accent)",
                        borderRadius: "var(--radius-md)",
                        color: "white",
                      }
                    : {
                        borderColor: "var(--color-border)",
                        color: "var(--color-text-secondary)",
                        borderRadius: "var(--radius-md)",
                      }
                }
                onMouseEnter={(e) => {
                  if (currentPage !== page) {
                    e.currentTarget.style.backgroundColor = "var(--color-surface-2)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== page) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                {page}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 h-9 px-3.5 text-sm font-medium border rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-text-secondary)",
            borderRadius: "var(--radius-md)",
          }}
          onMouseEnter={(e) => {
            if (currentPage !== totalPages) {
              e.currentTarget.style.backgroundColor = "var(--color-surface-2)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
