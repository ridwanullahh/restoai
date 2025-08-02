import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  className = ''
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);
    
    // Adjust if we're near the beginning or end
    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisiblePages);
    }
    if (currentPage > totalPages - halfVisible) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1);
    }
    
    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }
    
    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const buttonClasses = 'px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors';
  const activeButtonClasses = 'px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-300 hover:bg-orange-100';
  const disabledButtonClasses = 'px-3 py-2 text-sm font-medium text-gray-300 bg-gray-100 border border-gray-300 cursor-not-allowed';

  return (
    <nav className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center space-x-1">
        {/* First Page */}
        {showFirstLast && currentPage > 1 && (
          <button
            onClick={() => handlePageChange(1)}
            className={`${buttonClasses} rounded-l-md`}
          >
            First
          </button>
        )}

        {/* Previous Page */}
        {showPrevNext && (
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`${
              currentPage === 1 ? disabledButtonClasses : buttonClasses
            } ${!showFirstLast || currentPage === 1 ? 'rounded-l-md' : ''}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Page Numbers */}
        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-sm font-medium text-gray-500">
                <MoreHorizontal className="w-4 h-4" />
              </span>
            ) : (
              <button
                onClick={() => handlePageChange(page as number)}
                className={
                  page === currentPage
                    ? activeButtonClasses
                    : buttonClasses
                }
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* Next Page */}
        {showPrevNext && (
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`${
              currentPage === totalPages ? disabledButtonClasses : buttonClasses
            } ${!showFirstLast || currentPage === totalPages ? 'rounded-r-md' : ''}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Last Page */}
        {showFirstLast && currentPage < totalPages && (
          <button
            onClick={() => handlePageChange(totalPages)}
            className={`${buttonClasses} rounded-r-md`}
          >
            Last
          </button>
        )}
      </div>

      {/* Page Info */}
      <div className="text-sm text-gray-700">
        Page {currentPage} of {totalPages}
      </div>
    </nav>
  );
};

export default Pagination;
