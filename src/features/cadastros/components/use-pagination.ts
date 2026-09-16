import { useState, useMemo } from "react";

/**
 * Hook de paginação client-side.
 * Divide um array em páginas e fornece controles de navegação.
 */
export function usePagination<T>(items: T[], pageSize = 12) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedItems = useMemo(
    () => items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [items, currentPage, pageSize],
  );

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  function goTo(p: number) {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }

  function nextPage() {
    if (canNext) setPage((p) => p + 1);
  }

  function prevPage() {
    if (canPrev) setPage((p) => p - 1);
  }

  // Reset to page 1 when items change (e.g., filter applied)
  function reset() {
    setPage(1);
  }

  return {
    paginatedItems,
    currentPage,
    totalPages,
    canPrev,
    canNext,
    goTo,
    nextPage,
    prevPage,
    reset,
    totalItems: items.length,
  };
}
