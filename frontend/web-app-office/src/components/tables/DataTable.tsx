import React from 'react';
import { TableSkeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { Pagination } from './Pagination';

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionText?: string;
  onEmptyAction?: () => void;
  // Pagination
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id?: any; [key: string]: any }>({
  columns,
  data,
  isLoading,
  emptyTitle = 'No Records Found',
  emptyDescription = 'There are no records matching your current filter criteria.',
  emptyActionText,
  onEmptyAction,
  pagination,
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return <TableSkeleton rows={5} columns={columns.length} />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionText={emptyActionText}
          onAction={onEmptyAction}
        />
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 ${
                    col.headerClassName || ''
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {data.map((row, rowIdx) => (
              <tr
                key={row.id || row.registrationNumber || row.fishermanId || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors duration-150 ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-blue-50/40 active:bg-blue-50/70'
                    : 'hover:bg-slate-50/50'
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`px-6 py-4 ${col.className || ''}`}>
                    {typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : col.accessor
                      ? (row[col.accessor] as any)
                      : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalElements={pagination.totalElements}
          pageSize={pagination.pageSize}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
        />
      )}
    </div>
  );
}
