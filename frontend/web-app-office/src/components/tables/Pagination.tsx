import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '../common/Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const startItem = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white border-t border-slate-200">
      <div className="flex items-center gap-4 text-xs text-slate-600">
        <span>
          Showing <span className="font-semibold text-slate-900">{startItem}</span> to{' '}
          <span className="font-semibold text-slate-900">{endItem}</span> of{' '}
          <span className="font-semibold text-slate-900">{totalElements}</span> records
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-white border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-tnnavy-500"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0}
          className="px-2 py-1 h-8"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="px-2 py-1 h-8"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <span className="px-3 py-1 text-xs font-semibold text-slate-700">
          Page {currentPage + 1} of {Math.max(totalPages, 1)}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || totalPages === 0}
          className="px-2 py-1 h-8"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage >= totalPages - 1 || totalPages === 0}
          className="px-2 py-1 h-8"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
