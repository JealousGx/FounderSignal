import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  maxPageButtons?: number;
}

export const PaginationWithPageSize = ({
  currentPage,
  totalPages,
  itemsPerPage,
  handlePageChange,
  handlePageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}: {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (pageSize: string) => void;
  className?: string;
  pageSizeOptions?: number[];
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 w-full">
      <div className="flex items-center">
        <span className="text-sm mr-3">Page size:</span>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={handlePageSizeChange}
        >
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder={itemsPerPage} />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            {pageSizeOptions?.map((option) => (
              <SelectItem key={option} value={option.toString()}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
  maxPageButtons = 5,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }
  const getPageNumbers = () => {
    const pageNumbers = [];

    pageNumbers.push(1);

    const startPage = Math.max(2, currentPage - Math.floor(maxPageButtons / 2));
    const endPage = Math.min(totalPages - 1, startPage + maxPageButtons - 3);

    if (startPage > 2) {
      pageNumbers.push("...");
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages - 1) {
      pageNumbers.push("...");
    }

    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous Page</span>
      </Button>

      {pageNumbers.map((page, index) => {
        if (page === "...") {
          return (
            <span key={`ellipsis-${index}`} className="px-2">
              ...
            </span>
          );
        }

        return (
          <Button
            key={`page-${page}`}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page as number)}
            aria-current={currentPage === page ? "page" : undefined}
            aria-label={`Page ${page}`}
          >
            {page}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next Page</span>
      </Button>
    </div>
  );
}
