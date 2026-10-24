import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { permitService } from '../../services/permit';
import { Permit } from '../../types';
import { DataTable, Column } from '../../components/tables/DataTable';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { PermitDetailDrawer } from './PermitDetailDrawer';
import { useDebounce } from '../../hooks/useDebounce';
import { calculateTimeRemaining, formatDateTime } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { CheckCircle2, Search, Eye, Users, RefreshCw, Clock } from 'lucide-react';

export const ApprovedPermits: React.FC = () => {
  const { user } = useAuth();
  const harbour = user?.assignedHarbour || 'Rameswaram';

  const [permits, setPermits] = useState<Permit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const debouncedSearch = useDebounce(searchTerm, 400);
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchApprovedPermits = async () => {
    setIsLoading(true);
    try {
      const response = await permitService.getPermits({
        harbour,
        status: 'APPROVED',
        search: debouncedSearch,
        page: currentPage,
        size: pageSize,
      });
      setPermits(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      toast.error('Failed to load approved departure permits.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearch, harbour]);

  useEffect(() => {
    fetchApprovedPermits();
  }, [harbour, debouncedSearch, currentPage, pageSize]);

  const columns: Column<Permit>[] = [
    {
      header: 'Permit Number',
      accessor: (row) => (
        <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
          {row.permitNumber || `TN-FP-2026-${String(row.id).padStart(6, '0')}`}
        </span>
      ),
    },
    {
      header: 'Boat Registration',
      accessor: (row) => (
        <div>
          <span className="font-mono text-xs font-bold text-slate-900 block">{row.registrationNumber}</span>
          <span className="text-xs text-slate-500">{row.boatName}</span>
        </div>
      ),
    },
    {
      header: 'Boat Owner',
      accessor: (row) => (
        <span className="font-medium text-slate-900">{row.ownerName}</span>
      ),
    },
    {
      header: 'Crew Members',
      accessor: (row) => (
        <span className="inline-flex items-center gap-1 font-semibold text-slate-800 text-xs">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          {row.crewCount} crew members
        </span>
      ),
    },
    {
      header: 'Approved Time',
      accessor: (row) => (
        <span className="text-xs font-medium text-slate-700">
          {row.approvedTime ||
            (row.expiryDate
              ? new Date(new Date(row.expiryDate).getTime() - 24 * 60 * 60 * 1000).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })
              : row.submittedTime || 'N/A')}
        </span>
      ),
    },
    {
      header: 'Expiry Time',
      accessor: (row) => {
        const remaining = calculateTimeRemaining(row.expiryDate);
        return (
          <div className="text-xs">
            <span className="font-medium text-slate-800 block">
              {row.expiryDate ? formatDateTime(row.expiryDate) : '24h window'}
            </span>
            <span className={`text-[11px] font-semibold flex items-center gap-1 ${remaining.isExpired ? 'text-slate-400' : 'text-emerald-600'}`}>
              <Clock className="w-3 h-3" />
              {remaining.text}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessor: (row) => <Badge status={row.status} size="sm" />,
    },
    {
      header: 'Action',
      accessor: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPermit(row);
            setIsDrawerOpen(true);
          }}
          className="h-8 px-2.5 text-xs"
          leftIcon={<Eye className="w-3.5 h-3.5" />}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Approved Departure Permits
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              {totalElements} Active Permits
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Harbour Station: <span className="font-semibold text-slate-800">{harbour}</span> • Valid scannable departure tokens currently authorized.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-72">
            <Input
              placeholder="Search by permit, boat or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchApprovedPermits}
            className="h-10 px-3"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={permits}
        isLoading={isLoading}
        emptyTitle="No Approved Permits Found"
        emptyDescription={`No approved departure permits are active for ${harbour} harbour.`}
        pagination={{
          currentPage,
          totalPages,
          totalElements,
          pageSize,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
        onRowClick={(row) => {
          setSelectedPermit(row);
          setIsDrawerOpen(true);
        }}
      />

      <PermitDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        permit={selectedPermit}
      />
    </div>
  );
};
