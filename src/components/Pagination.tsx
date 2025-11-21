// src/components/Pagination.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
}

export default function Pagination({ totalItems, itemsPerPage, currentPage }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // যদি ১টির বেশি পেজ না থাকে, তবে বাটন দেখানোর দরকার নেই
  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    // বর্তমান URL এর প্যারামিটারগুলো (যেমন সার্চ কুয়েরি) ধরে রাখা
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-8 mb-12">
      {/* Previous Button */}
      <button
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
        className="px-3 py-1 rounded border border-gray-600 text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Prev
      </button>

      {/* Page Numbers */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
      ))}

      {/* Next Button */}
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