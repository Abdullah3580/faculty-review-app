
"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
}

const getPageNumbers = (current: number, total: number): (number | "...")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
};

export default function Pagination({ totalItems, itemsPerPage, currentPage }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  
  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-8 mb-12">
      <button
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
        className="px-3 py-1 rounded border border-gray-600 text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Prev
      </button>

            {getPageNumbers(currentPage, totalPages).map((page, i) =>
        page === "..." ? (
          <span key={`dots-${i}`} className="px-1 text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 rounded border ${
              currentPage === page
                ? "bg-indigo-600 text-white border-indigo-600"
                : "border-gray-600 text-gray-300 hover:bg-gray-800"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        className="px-3 py-1 rounded border border-gray-600 text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}