import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface PaginationNavProps {
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
}

function PaginationNav({ page, setPage, totalPages }: PaginationNavProps) {
  const isFirstPage = page === 1;
  const isLastPage = page === totalPages;

  return (
    <div
      role="navigation"
      aria-label="Pagination"
      className="flex items-center justify-left gap-4 py-2"
    >
      <Button
        variant="secondary"
        className="rounded-full size-8 transition-all hover:bg-secondary"
        onClick={() => setPage(page - 1)}
        disabled={isFirstPage}
        aria-label="Previous page"
      >
        <ChevronLeft className={isFirstPage ? "opacity-50" : "opacity-100"} />
      </Button>

      <div className="flex items-center  justify-center text-sm">
        <span className="font-medium">
          <span>{page}</span> de <span>{totalPages}</span>
        </span>
      </div>

      <Button
        variant="secondary"
        className="rounded-full size-8 transition-all hover:bg-secondary"
        onClick={() => setPage(page + 1)}
        disabled={isLastPage}
        aria-label="Next page"
      >
        <ChevronRight className={isLastPage ? "opacity-50" : "opacity-100"} />
      </Button>
    </div>
  );
}

export default PaginationNav;
